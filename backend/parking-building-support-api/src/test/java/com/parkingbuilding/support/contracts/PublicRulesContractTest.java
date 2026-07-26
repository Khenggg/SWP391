package com.parkingbuilding.support.contracts;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract tests for {@code GET /api/public/rules}.
 *
 * <p><b>Why no @MockBean on a service or repository?</b>
 * {@code PublicRuleService} returns hardcoded static data with zero DB calls.
 * No mocking is required beyond {@code JdbcTemplate} (needed for context startup).
 *
 * <p><b>Contract shape:</b>
 * <pre>
 * {
 *   "success": true,
 *   "data": [
 *     { "group": "...", "title": "...", "content": ["...", "..."] },
 *     ...
 *   ]
 * }
 * </pre>
 *
 * <p><b>Important:</b> Tests do NOT assert the exact number of rule groups or
 * their specific string values. Only the structure is locked. Business content
 * may be updated without breaking the contract.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Contract – GET /api/public/rules")
class PublicRulesContractTest {

    private static final String ENDPOINT = "/api/public/rules";

    @Autowired
    private MockMvc mockMvc;

    // Required for context startup (JwtAccountStatusFilter in protected chain bean)
    @MockBean
    private JdbcTemplate jdbcTemplate;

    // ─── Scenario 1 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("1. Returns HTTP 200 without Authorization token (public endpoint)")
    void returnsOkWithoutToken() throws Exception {
        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // ─── Scenario 2 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("2. Response envelope: success=true")
    void responseEnvelopeSuccessIsTrue() throws Exception {
        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── Scenario 3 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("3. data is a non-null JSON array")
    void dataIsAnArray() throws Exception {
        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    // ─── Scenario 4 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("4. data array is not empty (at least one rule group exists)")
    void dataArrayIsNotEmpty() throws Exception {
        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    // ─── Scenario 5–8: First element structure ────────────────────────────────

    @Test
    @DisplayName("5-8. First element has required fields: group, title, content (non-empty array)")
    void firstElementHasRequiredFields() throws Exception {
        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                // group is a non-empty string
                .andExpect(jsonPath("$.data[0].group").isNotEmpty())
                // title is a non-empty string
                .andExpect(jsonPath("$.data[0].title").isNotEmpty())
                // content is a non-null array
                .andExpect(jsonPath("$.data[0].content").isArray())
                // content array has at least 1 item
                .andExpect(jsonPath("$.data[0].content").isNotEmpty());
    }

    // ─── Scenario 9 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("9. All items in data have non-null group field")
    void allItemsHaveGroupField() throws Exception {
        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                // jsonPath wildcard: every element must have group
                .andExpect(jsonPath("$.data[*].group").isNotEmpty())
                .andExpect(jsonPath("$.data[*].title").isNotEmpty())
                .andExpect(jsonPath("$.data[*].content").isNotEmpty());
    }
}
