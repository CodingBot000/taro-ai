package com.example.springservice.service;

import com.example.springservice.config.AppProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Component;

@Component
public class RequestRateLimiter {

    private static final long RATE_WINDOW_MILLIS = 60_000L;

    private final Map<String, ClientRequestWindow> requestLog = new ConcurrentHashMap<>();
    private final AtomicLong lastCleanupAt = new AtomicLong(0L);
    private final int requestsPerMinute;
    private final int maxTrackedClients;
    private final long clientTtlMillis;
    private final long cleanupIntervalMillis;

    public RequestRateLimiter(AppProperties appProperties) {
        AppProperties.RateLimit rateLimit = appProperties.getRateLimit();
        this.requestsPerMinute = Math.max(1, rateLimit.getRequestsPerMinute());
        this.maxTrackedClients = Math.max(1, rateLimit.getMaxTrackedClients());
        this.clientTtlMillis = positiveMillis(rateLimit.getClientTtl(), Duration.ofMinutes(5));
        this.cleanupIntervalMillis = positiveMillis(rateLimit.getCleanupInterval(), Duration.ofMinutes(1));
    }

    public boolean isRateLimited(String clientIp) {
        String key = (clientIp == null || clientIp.isBlank()) ? "unknown" : clientIp;
        long now = Instant.now().toEpochMilli();
        cleanupExpiredClients(now);

        if (!requestLog.containsKey(key) && requestLog.size() >= maxTrackedClients) {
            cleanupExpiredClients(now, true);
            if (requestLog.size() >= maxTrackedClients) {
                return true;
            }
        }

        ClientRequestWindow window = requestLog.computeIfAbsent(key, ignored -> new ClientRequestWindow());

        synchronized (window) {
            window.lastSeenAt = now;
            while (!window.timestamps.isEmpty() && now - window.timestamps.peekFirst() >= RATE_WINDOW_MILLIS) {
                window.timestamps.removeFirst();
            }

            if (window.timestamps.size() >= requestsPerMinute) {
                return true;
            }

            window.timestamps.addLast(now);
            return false;
        }
    }

    private long positiveMillis(Duration configured, Duration fallback) {
        Duration effective = configured == null || configured.isZero() || configured.isNegative()
            ? fallback
            : configured;
        return effective.toMillis();
    }

    private void cleanupExpiredClients(long now) {
        cleanupExpiredClients(now, false);
    }

    private void cleanupExpiredClients(long now, boolean force) {
        long lastCleanup = lastCleanupAt.get();
        if (!force && now - lastCleanup < cleanupIntervalMillis) {
            return;
        }

        if (!lastCleanupAt.compareAndSet(lastCleanup, now) && !force) {
            return;
        }

        requestLog.entrySet().removeIf(entry -> now - entry.getValue().lastSeenAt >= clientTtlMillis);
    }

    private static class ClientRequestWindow {
        private final Deque<Long> timestamps = new ArrayDeque<>();
        private volatile long lastSeenAt = Instant.now().toEpochMilli();
    }
}
