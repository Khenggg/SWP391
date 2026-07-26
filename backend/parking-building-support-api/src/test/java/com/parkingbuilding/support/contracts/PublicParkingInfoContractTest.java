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

import com.parkingbuilding.support.sharedreadmodel.repository.AreaReadRepository;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract tests for {@code GET /api/public/parking-info}.
 *
 * <p><b>Why @MockBean AreaReadRepository?</b>
 * {@code PublicParkingInfoController} injects {@code AreaReadRepository} directly
 * (no service layer abstraction). To avoid a real DB call, the repository must be mocked.
 * The stub returns a realistic {@code totalCapacity} value so the controller
 * can build a complete {@code ParkingInfoResponse}.
 *
 * <p><b>Contract shape:</b>
 * <pre>
 * {
 *   "success": true,
 *   "message": "...",
 *   "timestamp": "...",
 *   "data": {
 *     "name": "...",
 *     "address": "...",
 *     "openingHours": "...",
 *     "status": "...",
 *     "hotline": "...",
 *     "totalCapacity": 120
 *   }
 * }
 * </pre>
 *
 * <p><b>Tests do NOT assert specific business values</b> (e.g., name == "Parking Building").
 * They only lock the shape and presence of required fields.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Contract – GET /api/public/parking-info")
class PublicParkingInfoContractTest {

    private static final String ENDPOINT = "/api/public/parking-info";

    @Autowired
    private MockMvc mockMvc;

    // JdbcTemplate is required by JwtAccountStatusFilter bean at context load
    @MockBean
    private JdbcTemplate jdbcTemplate;

    // Direct dependency of PublicParkingInfoController (no service layer)
    @MockBean
    private AreaReadRepository areaReadRepository;

    // ─── Scenario 1 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("1. Returns HTTP 200 without Authorization token (public endpoint)")
    void returnsOkWithoutToken() throws Exception {
        when(areaReadRepository.sumTotalCapacity()).thenReturn(120);

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // ─── Scenario 2 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("2. Response envelope: success=true, message not blank, timestamp present")
    void responseEnvelopeIsCorrect() throws Exception {
        when(areaReadRepository.sumTotalCapacity()).thenReturn(50);

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    // ─── Scenario 3–8: Required fields in data ────────────────────────────────

    @Test
    @DisplayName("3-8. All required fields are present in data object")
    void allRequiredFieldsPresent() throws Exception {
        when(areaReadRepository.sumTotalCapacity()).thenReturn(200);

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").isNotEmpty())
                .andExpect(jsonPath("$.data.address").isNotEmpty())
                .andExpect(jsonPath("$.data.openingHours").isNotEmpty())
                .andExpect(jsonPath("$.data.status").isNotEmpty())
                .andExpect(jsonPath("$.data.hotline").isNotEmpty())
                .andExpect(jsonPath("$.data.totalCapacity").isNumber());
    }

    // ─── Scenario 9 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("9. totalCapacity reflects what the repository returns (not null)")
    void totalCapacityIsNotNull() throws Exception {
        when(areaReadRepository.sumTotalCapacity()).thenReturn(75);

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalCapacity").value(75));
    }
}
