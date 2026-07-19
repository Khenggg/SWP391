package com.parkingbuilding.support.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.parkingbuilding.support.sharedreadmodel.entity.*;
import com.parkingbuilding.support.sharedreadmodel.repository.*;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {
    @Mock
    private SlotReadRepository slotReadRepository;
    @Mock
    private AreaReadRepository areaReadRepository;
    @Mock
    private FloorReadRepository floorReadRepository;

    @Mock
    private ParkingSessionReadRepository parkingSessionReadRepository;
    @Mock
    private ParkingCardReadRepository parkingCardReadRepository;
    @Mock
    private PaymentReadRepository paymentReadRepository;
    @Mock
    private LostCardCaseReadRepository lostCardCaseReadRepository;
    @Mock
    private PlateMismatchCaseReadRepository plateMismatchCaseReadRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getDashboard_shouldReturnData() {

        FloorReadEntity floor = new FloorReadEntity();
        floor.setId(1L);
        floor.setStatus("ACTIVE");

        AreaReadEntity area = new AreaReadEntity();
        area.setId(1L);
        area.setFloorId(1L);
        area.setStatus("ACTIVE");

        when(floorReadRepository.findByStatus("ACTIVE")).thenReturn(List.of(floor));
        when(areaReadRepository.findByStatus("ACTIVE")).thenReturn(List.of(area));

        SlotReadEntity slot = new SlotReadEntity();
        slot.setAreaId(1L);

        when(slotReadRepository.findByStatus("AVAILABLE")).thenReturn(List.of(slot));
        when(slotReadRepository.findByStatus("OCCUPIED")).thenReturn(List.of());
        when(slotReadRepository.findByStatus("RESERVED")).thenReturn(List.of());
        when(slotReadRepository.findByStatus("LOCKED")).thenReturn(List.of());
        when(slotReadRepository.findByStatus("MAINTENANCE")).thenReturn(List.of());

        when(parkingSessionReadRepository.countByEntryTimeBetween(
                any(Instant.class),
                any(Instant.class))).thenReturn(10L);

        when(parkingSessionReadRepository.countByExitTimeBetween(
                any(Instant.class),
                any(Instant.class))).thenReturn(5L);
        when(parkingSessionReadRepository.countByStatus("ACTIVE")).thenReturn(3L);

        when(paymentReadRepository.sumRevenueBetween(any(), any()))
                .thenReturn(BigDecimal.valueOf(1000));

        when(parkingCardReadRepository.countByStatus(anyString())).thenReturn(1L);
        when(lostCardCaseReadRepository.countByStatus("PENDING")).thenReturn(2L);
        when(plateMismatchCaseReadRepository.countByStatus("PENDING")).thenReturn(3L);

        var result = dashboardService.getDashboard();

        assertNotNull(result);
        assertNotNull(result.getSlot());
        assertNotNull(result.getTraffic());
        assertNotNull(result.getRevenue());
        assertNotNull(result.getCard());
        assertNotNull(result.getPending());
    }
}
