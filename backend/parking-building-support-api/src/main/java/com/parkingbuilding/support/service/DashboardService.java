package com.parkingbuilding.support.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.response.CardSummaryResponse;
import com.parkingbuilding.support.dto.response.DashboardResponse;
import com.parkingbuilding.support.dto.response.PendingSummaryResponse;
import com.parkingbuilding.support.dto.response.RevenueSummaryResponse;
import com.parkingbuilding.support.dto.response.SlotSummaryResponse;
import com.parkingbuilding.support.dto.response.TrafficSummaryResponse;
import com.parkingbuilding.support.sharedreadmodel.entity.AreaReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.FloorReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AreaReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.FloorReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.LostCardCaseReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.ParkingCardReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.ParkingSessionReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.PaymentReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.PlateMismatchCaseReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.SlotReadRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardService {

    private final SlotReadRepository slotReadRepository;
    private final AreaReadRepository areaReadRepository;
    private final FloorReadRepository floorReadRepository;

    private final ParkingSessionReadRepository parkingSessionReadRepository;
    private final ParkingCardReadRepository parkingCardReadRepository;
    private final PaymentReadRepository paymentReadRepository;
    private final LostCardCaseReadRepository lostCardCaseReadRepository;
    private final PlateMismatchCaseReadRepository plateMismatchCaseReadRepository;

    public DashboardResponse getDashboard() {

        return DashboardResponse.builder()
                .slot(getSlotSummary())
                .traffic(getTrafficSummary())
                .revenue(getRevenueSummary())
                .card(getCardSummary())
                .pending(getPendingSummary())
                .build();
    }

    private SlotSummaryResponse getSlotSummary() {

        List<Long> activeFloorIds = floorReadRepository.findByStatus("ACTIVE")
                .stream()
                .map(FloorReadEntity::getId)
                .toList();

        List<Long> activeAreaIds = areaReadRepository.findByStatus("ACTIVE")
                .stream()
                .filter(area -> activeFloorIds.contains(area.getFloorId()))
                .map(AreaReadEntity::getId)
                .toList();

        long available = slotReadRepository.findByStatus("AVAILABLE")
                .stream()
                .filter(slot -> activeAreaIds.contains(slot.getAreaId()))
                .count();

        long occupied = slotReadRepository.findByStatus("OCCUPIED")
                .stream()
                .filter(slot -> activeAreaIds.contains(slot.getAreaId()))
                .count();

        long reserved = slotReadRepository.findByStatus("RESERVED")
                .stream()
                .filter(slot -> activeAreaIds.contains(slot.getAreaId()))
                .count();

        long locked = slotReadRepository.findByStatus("LOCKED")
                .stream()
                .filter(slot -> activeAreaIds.contains(slot.getAreaId()))
                .count();

        long maintenance = slotReadRepository.findByStatus("MAINTENANCE")
                .stream()
                .filter(slot -> activeAreaIds.contains(slot.getAreaId()))
                .count();

        return SlotSummaryResponse.builder()
                .total(available + occupied + reserved + locked + maintenance)
                .available(available)
                .occupied(occupied)
                .reserved(reserved)
                .locked(locked)
                .maintenance(maintenance)
                .build();
    }

    private TrafficSummaryResponse getTrafficSummary() {

        Instant from = LocalDate.now()
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);

        Instant to = from.plusSeconds(86400);

        return TrafficSummaryResponse.builder()
                .entriesToday(parkingSessionReadRepository.countByEntryTimeBetween(from, to))
                .exitsToday(parkingSessionReadRepository.countByExitTimeBetween(from, to))
                .activeSessions(parkingSessionReadRepository.countByStatus("ACTIVE"))
                .build();
    }

    private RevenueSummaryResponse getRevenueSummary() {

        Instant from = LocalDate.now()
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);

        Instant to = from.plusSeconds(86400);

        BigDecimal revenue = paymentReadRepository.sumRevenueBetween(
                from.atOffset(ZoneOffset.UTC),
                to.atOffset(ZoneOffset.UTC));

        return RevenueSummaryResponse.builder()
                .todayRevenue(revenue)
                .build();
    }

    private CardSummaryResponse getCardSummary() {

        return CardSummaryResponse.builder()
                .available(parkingCardReadRepository.countByStatus("AVAILABLE"))
                .inUse(parkingCardReadRepository.countByStatus("IN_USE"))
                .lost(parkingCardReadRepository.countByStatus("LOST"))
                .damaged(parkingCardReadRepository.countByStatus("DAMAGED"))
                .inactive(parkingCardReadRepository.countByStatus("INACTIVE"))
                .build();
    }

    private PendingSummaryResponse getPendingSummary() {

        long lost = lostCardCaseReadRepository.countByStatus("PENDING");

        long plate = plateMismatchCaseReadRepository.countByStatus("PENDING");

        return PendingSummaryResponse.builder()
                .lostCardPending(lost)
                .plateMismatchPending(plate)
                .totalPending(lost + plate)
                .build();
    }
}
