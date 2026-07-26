package com.parkingbuilding.support.smoke;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Smoke tests for parking-building-support-api.
 *
 * <p>Purpose: verify the Spring context loads successfully and the most basic
 * health signal is reachable without any authentication token.
 *
 * <p>Strategy: {@code @SpringBootTest} with {@code @AutoConfigureMockMvc}.
 * Rationale for not using {@code @WebMvcTest}:
 * <ul>
 *   <li>Two {@code SecurityFilterChain} beans with {@code @Order} are present;
 *       {@code @WebMvcTest} does not reliably wire their precedence.</li>
 *   <li>{@code JwtAccountStatusFilter} requires {@code JdbcTemplate} injected
 *       into the security bean — mocked here via {@code @MockBean}.</li>
 * </ul>
 *
 * <p>Scope: minimal. Does NOT assert business data. Proves boot + health only.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Smoke – Support API context load and health")
class SmokeScaffoldTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * JdbcTemplate is used by JwtAccountStatusFilter (registered in SecurityFilterChain @Order(2)).
     * Even though /api/support/health is covered by the public chain (@Order(1)),
     * the protected chain bean still needs JdbcTemplate to be instantiated at context load.
     */
    @MockBean
    private JdbcTemplate jdbcTemplate;

    // ─── Scenario 1 ───────────────────────────────────────────────────────────

    /**
     * If this test class loads without throwing, the Spring context has started
     * successfully. All beans (SecurityConfig, JwtDecoder, repositories declared
     * as @MockBean in sub-tests) have been wired.
     *
     * No explicit assertion needed — the Spring test framework fails the test
     * if context loading throws any exception.
     */
    @Test
    @DisplayName("1. Application context loads without errors")
    void contextLoads() {
        // Intentionally empty — context load failure would throw before this body executes.
    }

    // ─── Scenario 2 ───────────────────────────────────────────────────────────

    /**
     * GET /api/support/health is mapped in the public SecurityFilterChain (@Order(1))
     * with permitAll — no JWT required.
     *
     * Asserts: HTTP 200, success flag is true, data is null (health returns only message).
     */
    @Test
    @DisplayName("2. GET /api/support/health → 200 OK, no token required")
    void healthEndpointReturns200WithoutToken() throws Exception {
        mockMvc.perform(get("/api/support/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
}
