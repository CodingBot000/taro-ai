package com.example.springservice.controller;

import com.example.springservice.config.AppProperties;
import com.example.springservice.dto.TarotRequest;
import com.example.springservice.dto.TarotResponse;
import com.example.springservice.dto.VersionResponse;
import com.example.springservice.exception.ApiException;
import com.example.springservice.service.RequestRateLimiter;
import com.example.springservice.service.TarotService;
import jakarta.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TarotController {

    private final TarotService tarotService;
    private final RequestRateLimiter requestRateLimiter;
    private final AppProperties appProperties;

    public TarotController(TarotService tarotService, RequestRateLimiter requestRateLimiter, AppProperties appProperties) {
        this.tarotService = tarotService;
        this.requestRateLimiter = requestRateLimiter;
        this.appProperties = appProperties;
    }

    @GetMapping("/version")
    public VersionResponse getVersion() {
        return tarotService.getBackendVersion();
    }

    @PostMapping("/tarot")
    public TarotResponse createReading(@RequestBody TarotRequest request, HttpServletRequest httpRequest) {
        String clientIp = resolveClientIp(httpRequest);
        if (requestRateLimiter.isRateLimited(clientIp)) {
            throw new ApiException(
                HttpStatus.TOO_MANY_REQUESTS,
                "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
                "RATE_LIMITED"
            );
        }

        return tarotService.createReading(request);
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (isTrustedProxy(request.getRemoteAddr())) {
            String cfConnectingIp = firstHeaderValue(request.getHeader("CF-Connecting-IP"));
            if (cfConnectingIp != null) {
                return cfConnectingIp;
            }

            String forwardedFor = firstHeaderValue(request.getHeader("X-Forwarded-For"));
            if (forwardedFor != null) {
                return forwardedFor;
            }
        }

        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }

    private String firstHeaderValue(String headerValue) {
        if (headerValue == null || headerValue.isBlank()) {
            return null;
        }

        String value = headerValue.split(",")[0].trim();
        return value.isBlank() ? null : value;
    }

    private boolean isTrustedProxy(String remoteAddress) {
        if (remoteAddress == null || remoteAddress.isBlank()) {
            return false;
        }

        List<String> configuredTrustedProxies = appProperties.getTrustedProxyAddresses();
        if (configuredTrustedProxies.stream().map(String::trim).anyMatch(remoteAddress::equals)) {
            return true;
        }

        try {
            InetAddress address = InetAddress.getByName(remoteAddress);
            return address.isLoopbackAddress() || address.isSiteLocalAddress();
        } catch (UnknownHostException exception) {
            return false;
        }
    }
}
