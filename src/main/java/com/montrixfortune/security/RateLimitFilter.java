package com.montrixfortune.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory brute-force protection for login / register / refresh.
 * Allows MAX_ATTEMPTS requests per client IP per WINDOW_MS. Fine for a single server instance.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_MS = 60_000L;

    private static final class Window {
        long start;
        int count;
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        return !(path.equals("/api/auth/login")
                || path.equals("/api/auth/register")
                || path.equals("/api/auth/refresh"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String key = request.getRemoteAddr() + "|" + request.getRequestURI();
        long now = System.currentTimeMillis();

        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().start > WINDOW_MS);
        }

        Window w = windows.computeIfAbsent(key, k -> new Window());
        boolean blocked;
        synchronized (w) {
            if (now - w.start > WINDOW_MS) {
                w.start = now;
                w.count = 0;
            }
            w.count++;
            blocked = w.count > MAX_ATTEMPTS;
        }

        if (blocked) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many attempts. Please try again in a minute.\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
