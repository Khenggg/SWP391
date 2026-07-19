package com.parkingbuilding.support.config;

import java.io.IOException;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAccountStatusFilter extends OncePerRequestFilter {

    private final JdbcTemplate jdbcTemplate;

    public JwtAccountStatusFilter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = jwtAuthentication.getToken().getClaimAsString("user_id");
        if (userId == null || !isActiveUser(userId)) {
            writeError(response, HttpServletResponse.SC_FORBIDDEN,
                    "Your account is disabled or inactive.", "AUTH_USER_INACTIVE");
            return;
        }

        String jwtId = jwtAuthentication.getToken().getId();
        String sessionId = jwtAuthentication.getToken().getClaimAsString("sid");
        if (isAccessTokenRevoked(jwtId) || isSessionRevoked(sessionId)) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Unauthorized. Token is invalid or revoked.", "UNAUTHORIZED");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isActiveUser(String userId) {
        Boolean active = jdbcTemplate.query(
                "SELECT status = 'ACTIVE' AND deleted_at IS NULL FROM users WHERE id = ?",
                statement -> statement.setLong(1, Long.parseLong(userId)),
                result -> result.next() && result.getBoolean(1));
        return Boolean.TRUE.equals(active);
    }

    private boolean isAccessTokenRevoked(String jwtId) {
        if (jwtId == null || jwtId.isBlank()) {
            return false;
        }

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM revoked_access_tokens WHERE jwt_id = ? AND expires_at > now()",
                Integer.class,
                jwtId);
        return count != null && count > 0;
    }

    private boolean isSessionRevoked(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return false;
        }

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM auth_sessions WHERE id = CAST(? AS uuid) AND revoked_at IS NOT NULL",
                Integer.class,
                sessionId);
        return count != null && count > 0;
    }

    private void writeError(
            HttpServletResponse response,
            int status,
            String message,
            String errorCode) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"success\":false,\"message\":\""
                + message
                + "\",\"data\":null,\"errors\":[\""
                + errorCode
                + "\"]}");
    }
}
