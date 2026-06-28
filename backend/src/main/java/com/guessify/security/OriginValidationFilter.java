package com.guessify.security;

import com.guessify.config.GuessifyProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class OriginValidationFilter extends OncePerRequestFilter {

    private final List<String> allowedOrigins;
    private final boolean requireOrigin;

    public OriginValidationFilter(GuessifyProperties properties) {
        this.allowedOrigins = Arrays.stream(properties.cors().allowedOrigins().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        this.requireOrigin = properties.security().requireOriginOnMutations();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (requireOrigin && isMutation(request) && request.getRequestURI().startsWith("/api/")
                && !request.getRequestURI().equals("/api/health")) {
            String origin = request.getHeader("Origin");
            if (origin == null || origin.isBlank()) {
                reject(response);
                return;
            }
            if (!isAllowedOrigin(origin)) {
                reject(response);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean isAllowedOrigin(String origin) {
        if (allowedOrigins.contains(origin)) {
            return true;
        }
        try {
            URI uri = URI.create(origin);
            String host = uri.getHost();
            if (host == null) {
                return false;
            }
            if (host.equals("localhost") || host.equals("127.0.0.1")) {
                return true;
            }
            return host.endsWith(".vercel.app");
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isMutation(HttpServletRequest request) {
        String method = request.getMethod();
        return HttpMethod.POST.matches(method) || HttpMethod.PUT.matches(method)
                || HttpMethod.DELETE.matches(method) || HttpMethod.PATCH.matches(method);
    }

    private void reject(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"code\":\"ORIGIN_REJECTED\",\"message\":\"Request origin not allowed\"}");
    }
}
