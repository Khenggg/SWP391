package com.parkingbuilding.support.unit;

import com.parkingbuilding.support.dto.response.AvailableSlotResponse;
import com.parkingbuilding.support.service.AvailableSlotService;
import com.parkingbuilding.support.sharedreadmodel.entity.AreaReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.FloorReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.SlotReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AreaReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.FloorReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.SlotReadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for AvailableSlotService business logic.
 *
 * <p>Validates the 4 layers of filtering:
 * 1. Base status filter (only AVAILABLE)
 * 2. Active floor filter (slots on inactive floors are excluded)
 * 3. Active area filter (slots in inactive areas are excluded)
 * 4. User parameter filters (vehicleType, area, floor)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Unit – AvailableSlotService Business Logic")
class AvailableSlotServiceUnitTest {

    @Mock
    private SlotReadRepository slotReadRepository;

    @Mock
    private AreaReadRepository areaReadRepository;

    @Mock
    private FloorReadRepository floorReadRepository;

    @InjectMocks
    private AvailableSlotService service;

    private SlotReadEntity slot1; // Floor 1, Area 1, Vehicle 1
    private SlotReadEntity slot2; // Floor 1, Area 1, Vehicle 2
    private SlotReadEntity slot3; // Floor 1, Area 2, Vehicle 1
    private SlotReadEntity slot4; // Floor 2, Area 3, Vehicle 1

    private FloorReadEntity floor1;
    private FloorReadEntity floor2;

    private AreaReadEntity area1;
    private AreaReadEntity area2;
    private AreaReadEntity area3;

    @BeforeEach
    void setUp() {
        floor1 = new FloorReadEntity(); floor1.setId(1L); floor1.setStatus("ACTIVE");
        floor2 = new FloorReadEntity(); floor2.setId(2L); floor2.setStatus("INACTIVE");

        area1 = new AreaReadEntity(); area1.setId(10L); area1.setFloorId(1L); area1.setStatus("ACTIVE");
        area2 = new AreaReadEntity(); area2.setId(20L); area2.setFloorId(1L); area2.setStatus("INACTIVE");
        area3 = new AreaReadEntity(); area3.setId(30L); area3.setFloorId(2L); area3.setStatus("ACTIVE"); // But floor is inactive!

        slot1 = new SlotReadEntity(); slot1.setId(101L); slot1.setAreaId(10L); slot1.setAllowedVehicleTypeId(1L);
        slot2 = new SlotReadEntity(); slot2.setId(102L); slot2.setAreaId(10L); slot2.setAllowedVehicleTypeId(2L);
        slot3 = new SlotReadEntity(); slot3.setId(103L); slot3.setAreaId(20L); slot3.setAllowedVehicleTypeId(1L);
        slot4 = new SlotReadEntity(); slot4.setId(104L); slot4.setAreaId(30L); slot4.setAllowedVehicleTypeId(1L);
    }

    private void stubRepositories(List<SlotReadEntity> slots) {
        when(slotReadRepository.findByStatus("AVAILABLE")).thenReturn(slots);
        when(floorReadRepository.findByStatus("ACTIVE")).thenReturn(List.of(floor1));
        when(areaReadRepository.findByStatus("ACTIVE")).thenReturn(List.of(area1, area3));
    }

    // ─── Scenarios ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("1. Returns only slots from active areas on active floors")
    void returnsOnlyActiveAreaAndFloorSlots() {
        // Setup: DB returns all 4 slots as "AVAILABLE"
        stubRepositories(List.of(slot1, slot2, slot3, slot4));

        List<AvailableSlotResponse> result = service.getAvailableSlots(null, null, null);

        // Expectation:
        // slot1 & slot2: area1 (active) -> floor1 (active) => INCLUDED
        // slot3: area2 (inactive) => EXCLUDED
        // slot4: area3 (active) -> floor2 (inactive) => EXCLUDED (area3 filtered out)
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(s -> s.getId().equals(101L)));
        assertTrue(result.stream().anyMatch(s -> s.getId().equals(102L)));
    }

    @Test
    @DisplayName("2. Filter by vehicleTypeId")
    void filterByVehicleTypeId() {
        stubRepositories(List.of(slot1, slot2));

        List<AvailableSlotResponse> result = service.getAvailableSlots(1L, null, null);

        assertEquals(1, result.size());
        assertEquals(101L, result.get(0).getId());
    }

    @Test
    @DisplayName("3. Filter by areaId (active area)")
    void filterByActiveAreaId() {
        stubRepositories(List.of(slot1, slot2));

        List<AvailableSlotResponse> result = service.getAvailableSlots(null, 10L, null);

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("4. Filter by areaId (inactive area) returns empty immediately")
    void filterByInactiveAreaId() {
        stubRepositories(List.of(slot1, slot2, slot3));

        List<AvailableSlotResponse> result = service.getAvailableSlots(null, 20L, null);

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("5. Filter by floorId (active floor)")
    void filterByActiveFloorId() {
        stubRepositories(List.of(slot1, slot2));
        when(areaReadRepository.findByFloorId(1L)).thenReturn(List.of(area1, area2));

        List<AvailableSlotResponse> result = service.getAvailableSlots(null, null, 1L);

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("6. Filter by floorId (inactive floor) returns empty immediately")
    void filterByInactiveFloorId() {
        stubRepositories(List.of(slot1, slot2, slot4));

        List<AvailableSlotResponse> result = service.getAvailableSlots(null, null, 2L);

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("7. No slots available returns empty list")
    void noSlotsAvailable() {
        stubRepositories(List.of());

        List<AvailableSlotResponse> result = service.getAvailableSlots(null, null, null);

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("8. getStats counts correctly with inactive filters applied")
    void getStats_countsCorrectly() {
        when(floorReadRepository.findByStatus("ACTIVE")).thenReturn(List.of(floor1));
        when(areaReadRepository.findByStatus("ACTIVE")).thenReturn(List.of(area1));

        // 2 active AVAILABLE, 1 inactive AVAILABLE
        when(slotReadRepository.findByStatus("AVAILABLE")).thenReturn(List.of(slot1, slot2, slot3));
        // 1 active OCCUPIED
        SlotReadEntity occ1 = new SlotReadEntity(); occ1.setAreaId(10L);
        when(slotReadRepository.findByStatus("OCCUPIED")).thenReturn(List.of(occ1));
        // 1 active RESERVED
        SlotReadEntity res1 = new SlotReadEntity(); res1.setAreaId(10L);
        when(slotReadRepository.findByStatus("RESERVED")).thenReturn(List.of(res1));

        Map<String, Long> stats = service.getStats();

        assertEquals(2L, stats.get("totalSlotsAvailable"));
        assertEquals(1L, stats.get("totalSlotsOccupied"));
        assertEquals(1L, stats.get("totalSlotsReserved"));
    }
}
