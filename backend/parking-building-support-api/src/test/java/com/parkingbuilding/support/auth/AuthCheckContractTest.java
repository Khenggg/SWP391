package com.parkingbuilding.support.auth;

import com.parkingbuilding.support.helper.JwtTestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract tests for {@code GET /api/support/auth-check}.
 *
 * <p><b>Endpoint security:</b> this endpoint falls under {@code SecurityFilterChain @Order(2)}
 * (the protected chain). It is NOT in the {@code /api/public/**} or {@code /api/support/health}
 * matcher of the public chain.
 *
 * <p><b>Rejection layers — understand clearly before reading the tests:</b>
 * <pre>
 * Layer 1 — BearerTokenAuthenticationFilter (Spring Security):
 *   Rejects missing/malformed/invalid-signature/expired/wrong-issuer/wrong-audience tokens → HTTP 401
 *   This is BEFORE the controller is ever invoked.
 *
 * Layer 2 — JwtAccountStatusFilter (custom filter, runs after Layer 1):
 *   Reads user_id claim, queries DB: if user inactive → HTTP 403 (AUTH_USER_INACTIVE)
 *   Reads jti+sid claims, queries DB: if token/session revoked → HTTP 401 (UNAUTHORIZED)
 *   This is STILL before the controller is invoked.
 *
 * Layer 3 — AuthCheckController:
 *   Only reached for fully valid, non-revoked tokens.
 *   No @PreAuthorize — any role returns HTTP 200.
 * </pre>
 *
 * <p><b>JdbcTemplate mock strategy:</b>
 * {@code JwtAccountStatusFilter} executes 3 SQL queries. By default this test
 * stubs the mock to simulate: user is ACTIVE, token not revoked, session not revoked.
 * Individual tests override these stubs as needed.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Auth – GET /api/support/auth-check security contract")
class AuthCheckContractTest {

    private static final String ENDPOINT = "/api/support/auth-check";

    @Autowired
    private MockMvc mockMvc;

    /**
     * JdbcTemplate is injected into JwtAccountStatusFilter inside the
     * SecurityFilterChain @Order(2) bean. Must be mocked to control DB query outcomes.
     */
    @MockBean
    private JdbcTemplate jdbcTemplate;

    /**
     * Default stubs: user is active, no revoked token, no revoked session.
     * Individual test methods override these stubs as needed.
     */
    @BeforeEach
    void stubJdbcTemplateDefaults() {
        // isActiveUser: SELECT status = 'ACTIVE' AND deleted_at IS NULL FROM users WHERE id = ?
        // → true (user is ACTIVE)
        doAnswer(inv -> {
            var setter = inv.getArgument(1, org.springframework.jdbc.core.PreparedStatementSetter.class);
            var rse    = inv.getArgument(2, org.springframework.jdbc.core.ResultSetExtractor.class);
            return Boolean.TRUE;
        }).when(jdbcTemplate).query(anyString(), any(org.springframework.jdbc.core.PreparedStatementSetter.class), any(org.springframework.jdbc.core.ResultSetExtractor.class));

        // isAccessTokenRevoked: SELECT COUNT(*) FROM revoked_access_tokens ... → 0 (not revoked)
        when(jdbcTemplate.queryForObject(
                anyString(), eq(Integer.class), anyString()))
                .thenReturn(0);
    }

    // ─── Layer 1 rejection cases (BearerTokenAuthenticationFilter) ────────────

    @Test
    @DisplayName("1. No Authorization header → 401 (no credential presented)")
    void noToken_returns401() throws Exception {
        mockMvc.perform(get(ENDPOINT))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("2. Authorization header with non-JWT value → 401 (malformed token)")
    void malformedToken_returns401() throws Exception {
        mockMvc.perform(get(ENDPOINT)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer this-is-not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("3. JWT signed with wrong secret → 401 (signature verification fails)")
    void wrongSecretToken_returns401() throws Exception {
        String token = JwtTestHelper.buildTokenWithWrongSecret();

        mockMvc.perform(get(ENDPOINT)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("4. JWT with wrong issuer → 401 (issuer validation fails)")
    void wrongIssuerToken_returns401() throws Exception {
        String token = JwtTestHelper.buildTokenWithWrongIssuer();

        mockMvc.perform(get(ENDPOINT)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("5. JWT with wrong audience → 401 (audience validation fails)")
    void wrongAudienceToken_returns401() throws Exception {
        String token = JwtTestHelper.buildTokenWithWrongAudience();

        mockMvc.perform(get(ENDPOINT)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("6. Expired JWT → 401 (expiry validation fails)")
    void expiredToken_returns401() throws Exception {
        String token = JwtTestHelper.buildExpiredToken();

        mockMvc.perform(get(ENDPOINT)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    // ─── Layer 2 rejection cases (JwtAccountStatusFilter) ────────────────────

    @Test
    @DisplayName("7. Valid JWT but user is inactive → 403 (JwtAccountStatusFilter)")
    void validToken_inactiveUser_returns403() throws Exception {
        // Override default stub: user is NOT active
        doAnswer(inv -> Boolean.FALSE)
                .when(jdbcTemplate).query(anyString(), any(org.springframework.jdbc.core.PreparedStatementSetter.class), any(org.springframework.jdbc.core.ResultSetExtractor.class));

        String token = JwtTestHelper.buildValidToken("STAFF", "42");

        mockMvc.perform(get(ENDPOINT)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("8. Valid JWT but access token is revoked → 401 (JwtAccountStatusFilter)")
    void validToken_revokedToken_returns401() throws Exception {
        // Override: revoked_access_tokens count = 1
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), anyString()))
                .thenReturn(1);

        String token = JwtTestHelper.buildValidToken("STAFF", "42");

        mockMvc.perform(get(ENDPOINT)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── Layer 3 — Controller reached (all validations pass) ──────────────────

    @Test
    @DisplayName("9. Valid JWT, all checks pass → 200 OK with authenticated=true")
    void validToken_allCheckPass_returns200() throws Exception {
        String token = JwtTestHelper.buildValidToken("ADMIN", "1");

        mockMvc.perform(get(ENDPOINT)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.authenticated").value(true));
    }

    @Test
    @DisplayName("10. Valid JWT → response data contains expected claim fields")
    void validToken_responseContainsClaimFields() throws Exception {
        String token = JwtTestHelper.buildValidToken("DRIVER", "99");

        mockMvc.perform(get(ENDPOINT)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.authenticated").value(true))
                // sub is set by JwtTestHelper as "test-user-{userId}"
                .andExpect(jsonPath("$.data.sub").isNotEmpty())
                // userId claim must be present
                .andExpect(jsonPath("$.data.userId").value("99"))
                // role claim
                .andExpect(jsonPath("$.data.role").value("DRIVER"))
                // iss must be present
                .andExpect(jsonPath("$.data.iss").isNotEmpty());
    }
}
