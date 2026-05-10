package com.example.springservice.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.springservice.config.AppProperties;
import java.time.Duration;
import org.junit.jupiter.api.Test;

class RequestRateLimiterTest {

    @Test
    void limitsRequestsWithinOneMinuteWindow() {
        AppProperties appProperties = new AppProperties();
        appProperties.getRateLimit().setRequestsPerMinute(2);
        RequestRateLimiter limiter = new RequestRateLimiter(appProperties);

        assertFalse(limiter.isRateLimited("203.0.113.10"));
        assertFalse(limiter.isRateLimited("203.0.113.10"));
        assertTrue(limiter.isRateLimited("203.0.113.10"));
    }

    @Test
    void rejectsNewClientWhenTrackedClientLimitIsFull() {
        AppProperties appProperties = new AppProperties();
        appProperties.getRateLimit().setRequestsPerMinute(10);
        appProperties.getRateLimit().setMaxTrackedClients(1);
        appProperties.getRateLimit().setClientTtl(Duration.ofMinutes(5));
        RequestRateLimiter limiter = new RequestRateLimiter(appProperties);

        assertFalse(limiter.isRateLimited("203.0.113.10"));
        assertTrue(limiter.isRateLimited("203.0.113.11"));
    }
}
