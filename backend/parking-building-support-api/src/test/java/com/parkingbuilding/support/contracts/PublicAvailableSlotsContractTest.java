package com.parkingbuilding.support.contracts;

import com.parkingbuilding.support.dto.response.AvailableSlotResponse;
import com.parkingbuilding.support.service.AvailableSlotService;
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

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract tests for {@code GET /api/public/available-slots}.
 *
 * <p><b>What this class tests:</b> HTTP contract — that the controller:
 * <ul>
 *   <li>Accepts the correct query parameters ({@code vehicleTypeId}, {@code areaId}, {@code floorId})</li>
 *   <li>Forwards them correctly to {@code AvailableSlotService}</li>
 *   <li>Serializes the service response correctly into the {@code ApiResponse} envelope</li>
 *   <li>Handles edge cases (empty list, single filter, combined filters)</li>
 * </ul>
 *
 * <p><b>What this class does NOT test:</b> the business filtering logic of
 * {@code AvailableSlotService} (AVAILABLE-only, inactive area/floor exclusion,
 * cross-filter logic). Those are covered by {@code AvailableSlotServiceUnitTest}.
 *
 * <p><b>Why @MockBean AvailableSlotService?</b>
 * The service contains significant business logic with multi-repository calls.
 * Mocking it here isolates the controller HTTP layer from the service layer.
 * We verify the controller passes params correctly and serializes responses correctly.
 *
 * <p><b>Contract shape per item:</b>
 * <pre>
 * {
 *   "id": Long,
 *   "slotCode": String,
 *   "areaId": Long,
 *   "vehicleTypeId": Long
 * }
 * </pre>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Contract – GET /api/public/available-slots")
class PublicAvailableSlotsContractTest {

    private static final String ENDPOINT = "/api/public/available-slots";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JdbcTemplate jdbcTemplate;

    @MockBean
    private AvailableSlotService availableSlotService;

    // ─── Test fixtures ────────────────────────────────────────────────────────

    private static AvailableSlotResponse slot(long id, String code, long areaId, long vehicleTypeId) {
        return new AvailableSlotResponse(id, code, areaId, vehicleTypeId);
    }

    // ─── Scenario 1 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("1. No filter → 200, returns all slots from service")
    void noFilter_returnsAllSlots() throws Exception {
        when(availableSlotService.getAvailableSlots(null, null, null))
                .thenReturn(List.of(
                        slot(1L, "A-01", 10L, 1L),
                        slot(2L, "A-02", 10L, 1L)));

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    // ─── Scenario 2 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("2. Filter by vehicleTypeId → 200, returns matching slots")
    void filterByVehicleTypeId_returnsMatchingSlots() throws Exception {
        when(availableSlotService.getAvailableSlots(1L, null, null))
                .thenReturn(List.of(slot(1L, "A-01", 10L, 1L)));

        mockMvc.perform(get(ENDPOINT)
                        .param("vehicleTypeId", "1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].vehicleTypeId").value(1));
    }

    // ─── Scenario 3 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("3. Filter by areaId → 200, returns slots in that area")
    void filterByAreaId_returnsMatchingSlots() throws Exception {
        when(availableSlotService.getAvailableSlots(null, 5L, null))
                .thenReturn(List.of(slot(3L, "B-01", 5L, 2L)));

        mockMvc.perform(get(ENDPOINT)
                        .param("areaId", "5")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].areaId").value(5));
    }

    // ─── Scenario 4 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("4. Filter by floorId → 200, returns slots in that floor")
    void filterByFloorId_returnsMatchingSlots() throws Exception {
        when(availableSlotService.getAvailableSlots(null, null, 2L))
                .thenReturn(List.of(
                        slot(4L, "C-01", 6L, 1L),
                        slot(5L, "C-02", 6L, 1L),
                        slot(6L, "C-03", 7L, 2L)));

        mockMvc.perform(get(ENDPOINT)
                        .param("floorId", "2")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3));
    }

    // ─── Scenario 5 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("5. Combined filters → 200, correct slot count")
    void combinedFilters_returnsCorrectSlots() throws Exception {
        when(availableSlotService.getAvailableSlots(1L, null, 2L))
                .thenReturn(List.of(slot(4L, "C-01", 6L, 1L)));

        mockMvc.perform(get(ENDPOINT)
                        .param("vehicleTypeId", "1")
                        .param("floorId", "2")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    // ─── Scenario 6 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("6. No slots available → 200, data is empty array (NOT null)")
    void noSlotsAvailable_dataIsEmptyArray() throws Exception {
        when(availableSlotService.getAvailableSlots(null, null, null))
                .thenReturn(List.of());

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    // ─── Scenario 7–10: Response field shapes ─────────────────────────────────

    @Test
    @DisplayName("7-10. Slot item contains all required fields with correct types")
    void slotItemHasAllRequiredFields() throws Exception {
        when(availableSlotService.getAvailableSlots(null, null, null))
                .thenReturn(List.of(slot(10L, "A-01", 3L, 1L)));

        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").isNumber())
                .andExpect(jsonPath("$.data[0].slotCode").isNotEmpty())
                .andExpect(jsonPath("$.data[0].areaId").isNumber())
                .andExpect(jsonPath("$.data[0].vehicleTypeId").isNumber());
    }

    // ─── Scenario 11 ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("11. No Authorization header required (public endpoint)")
    void noAuthRequired() throws Exception {
        when(availableSlotService.getAvailableSlots(null, null, null))
                .thenReturn(List.of(slot(1L, "A-01", 1L, 1L)));

        // No Authorization header
        mockMvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
