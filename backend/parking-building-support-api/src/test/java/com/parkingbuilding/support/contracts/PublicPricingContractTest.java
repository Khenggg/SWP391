package com.parkingbuilding.support.contracts;

import com.parkingbuilding.support.sharedreadmodel.entity.PricingRuleReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.VehicleTypeReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.PricingRuleReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.VehicleTypeReadRepository;
import org.junit.jupiter.api.BeforeEach;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract tests for {@code GET /api/public/pricing}.
 *
 * <p><b>Mocking strategy:</b> {@code PublicPricingService} calls two repositories:
 * <ul>
 *   <li>{@code PricingRuleReadRepository.findByStatus("ACTIVE")}</li>
 *   <li>{@code VehicleTypeReadRepository.findByIsActiveTrue()}</li>
 * </ul>
 * Both are mocked here to avoid a real DB connection.
 *
 * <p><b>Contract shape per item:</b>
 * <pre>
 * {
 *   "pricingRuleId": Long,
 *   "vehicleTypeId": Long,
 *   "vehicleTypeName": String,
 *   "requiresSlot": Boolean,
 *   "dayPrice": BigDecimal >= 0,
 *   "nightPrice": BigDecimal >= 0,
 *   "monthlyPrice": BigDecimal >= 0,
 *   "reservationHourlyPrice": BigDecimal,
 *   "maxReservationHours": Integer,
 *   "lostCardFee": BigDecimal
 * }
 * </pre>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Contract – GET /api/public/pricing")
class PublicPricingContractTest {

    private static final String ENDPOINT = "/api/public/pricing";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JdbcTemplate jdbcTemplate;

    @MockBean
    private PricingRuleReadRepository pricingRuleReadRepository;

    @MockBean
    private VehicleTypeReadRepository vehicleTypeReadRepository;

    // ─── Test data ────────────────────────────────────────────────────────────

    private PricingRuleReadEntity activePricingRule;
    private VehicleTypeReadEntity activeVehicleType;

    @BeforeEach
    void setUpTestData() {
        activeVehicleType = new VehicleTypeReadEntity();
        activeVehicleType.setId(1L);
        activeVehicleType.setName("Motorbike");
        activeVehicleType.setIsActive(true);
        activeVehicleType.setRequiresSlot(false);

        activePricingRule = new PricingRuleReadEntity();
        activePricingRule.setId(10L);
        activePricingRule.setVehicleTypeId(1L);
        activePricingRule.setDayPrice(new BigDecimal("5000"));
        activePricingRule.setNightPrice(new BigDecimal("3000"));
        activePricingRule.setMonthlyPrice(new BigDecimal("300000"));
        activePricingRule.setReservationHourlyPrice(new BigDecimal("2000"));
        activePricingRule.setMaxReservationHours(3);
        activePricingRule.setLostCardFee(new BigDecimal("50000"));
        activePricingRule.setStatus("ACTIVE");
    }

    // ─── Scenario 1 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("1. Returns HTTP 200 without Authorization token (public endpoint)")
    void returnsOkWithoutToken() throws Exception {
        when(vehicleTypeReadRepository.findByIsActiveTrue()).thenReturn(List.of(activeVehicleType));
        when(pricingRuleReadRepository.findByStatus(anyString())).thenReturn(List.of(activePricingRule));

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // ─── Scenario 2 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("2. Response envelope: success=true")
    void responseEnvelopeSuccessIsTrue() throws Exception {
        when(vehicleTypeReadRepository.findByIsActiveTrue()).thenReturn(List.of(activeVehicleType));
        when(pricingRuleReadRepository.findByStatus(anyString())).thenReturn(List.of(activePricingRule));

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── Scenario 3 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("3. data is a non-null JSON array")
    void dataIsArray() throws Exception {
        when(vehicleTypeReadRepository.findByIsActiveTrue()).thenReturn(List.of(activeVehicleType));
        when(pricingRuleReadRepository.findByStatus(anyString())).thenReturn(List.of(activePricingRule));

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    // ─── Scenario 4 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("4. When active pricing rules exist, data reflects the number returned by service")
    void dataReflectsActiveRuleCount() throws Exception {
        when(vehicleTypeReadRepository.findByIsActiveTrue()).thenReturn(List.of(activeVehicleType));
        when(pricingRuleReadRepository.findByStatus("ACTIVE")).thenReturn(List.of(activePricingRule));

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    // ─── Scenario 5–10: Field shapes ──────────────────────────────────────────

    @Test
    @DisplayName("5-10. First item contains all required fields with correct types")
    void firstItemHasAllRequiredFields() throws Exception {
        when(vehicleTypeReadRepository.findByIsActiveTrue()).thenReturn(List.of(activeVehicleType));
        when(pricingRuleReadRepository.findByStatus(anyString())).thenReturn(List.of(activePricingRule));

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].pricingRuleId").isNumber())
                .andExpect(jsonPath("$.data[0].vehicleTypeId").isNumber())
                .andExpect(jsonPath("$.data[0].vehicleTypeName").isNotEmpty())
                .andExpect(jsonPath("$.data[0].requiresSlot").isBoolean())
                .andExpect(jsonPath("$.data[0].dayPrice").isNumber())
                .andExpect(jsonPath("$.data[0].nightPrice").isNumber())
                .andExpect(jsonPath("$.data[0].monthlyPrice").isNumber())
                .andExpect(jsonPath("$.data[0].reservationHourlyPrice").isNumber())
                .andExpect(jsonPath("$.data[0].maxReservationHours").isNumber())
                .andExpect(jsonPath("$.data[0].lostCardFee").isNumber());
    }

    // ─── Scenario 11 ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("11. dayPrice and nightPrice are non-negative")
    void pricesAreNonNegative() throws Exception {
        when(vehicleTypeReadRepository.findByIsActiveTrue()).thenReturn(List.of(activeVehicleType));
        when(pricingRuleReadRepository.findByStatus(anyString())).thenReturn(List.of(activePricingRule));

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                // 5000 >= 0
                .andExpect(jsonPath("$.data[0].dayPrice").value(5000))
                // 3000 >= 0
                .andExpect(jsonPath("$.data[0].nightPrice").value(3000));
    }

    // ─── Scenario 12 ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("12. When no active pricing rules exist, data is empty array (not null)")
    void whenNoPricingRules_dataIsEmptyArray() throws Exception {
        when(vehicleTypeReadRepository.findByIsActiveTrue()).thenReturn(List.of());
        when(pricingRuleReadRepository.findByStatus(anyString())).thenReturn(List.of());

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));
    }
}
