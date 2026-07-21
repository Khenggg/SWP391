package com.parkingbuilding.support.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.parkingbuilding.support.dto.response.VehicleEntryExitHistoryResponse;
import com.parkingbuilding.support.dto.response.VehicleHistoryPagedResponse;
import com.parkingbuilding.support.sharedreadmodel.entity.DriverProfileReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.ParkingSession;
import com.parkingbuilding.support.sharedreadmodel.entity.ParkingSessionImage;
import com.parkingbuilding.support.sharedreadmodel.entity.PaymentReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.DriverProfileReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.ParkingSessionImageReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.ParkingSessionReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.PaymentReadRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DriverVehicleHistoryService {

    private final ParkingSessionReadRepository parkingSessionReadRepository;
    private final DriverProfileReadRepository driverProfileReadRepository;
    private final PaymentReadRepository paymentReadRepository;
    private final ParkingSessionImageReadRepository parkingSessionImageReadRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public VehicleHistoryPagedResponse searchHistory(
            String keyword,
            String status,
            Instant fromDate,
            Instant toDate,
            int page,
            int pageSize,
            Long userId,
            String role) {

        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("fromDate must not be later than toDate.");
        }

        int zeroIndexedPage = Math.max(0, page - 1);
        int normalizedSize = pageSize <= 0 ? 20 : Math.min(pageSize, 100);
        Pageable pageable = PageRequest.of(zeroIndexedPage, normalizedSize);

        StringBuilder where = new StringBuilder(" where 1 = 1");
        Map<String, Object> params = new HashMap<>();

        if ("DRIVER".equalsIgnoreCase(role)) {
            DriverProfileReadEntity driver = driverProfileReadRepository.findByUserId(userId)
                    .orElseThrow(() -> new EntityNotFoundException("Driver profile not found."));
            where.append(" and sess.driverId = :driverId");
            params.put("driverId", driver.getId());
        }

        if (StringUtils.hasText(keyword)) {
            where.append(" and lower(sess.plateNumber) like :keyword");
            params.put("keyword", "%" + keyword.trim().toLowerCase() + "%");
        }

        if (StringUtils.hasText(status)) {
            if ("IN_BUILDING".equalsIgnoreCase(status)) {
                where.append(" and sess.status = 'ACTIVE'");
            } else if ("DEPARTED".equalsIgnoreCase(status)) {
                where.append(" and sess.status = 'COMPLETED'");
            }
        }

        if (fromDate != null) {
            where.append(" and sess.entryTime >= :fromDate");
            params.put("fromDate", fromDate);
        }

        if (toDate != null) {
            where.append(" and sess.entryTime <= :toDate");
            params.put("toDate", toDate);
        }

        TypedQuery<ParkingSession> query = entityManager.createQuery(
                "select sess from ParkingSession sess" + where + " order by sess.entryTime desc",
                ParkingSession.class
        );
        TypedQuery<Long> countQuery = entityManager.createQuery(
                "select count(sess) from ParkingSession sess" + where,
                Long.class
        );

        params.forEach((name, value) -> {
            query.setParameter(name, value);
            countQuery.setParameter(name, value);
        });

        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<ParkingSession> list = query.getResultList();
        long totalElements = countQuery.getSingleResult();
        int totalPages = (int) Math.ceil((double) totalElements / pageable.getPageSize());

        List<VehicleEntryExitHistoryResponse> items = list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new VehicleHistoryPagedResponse(items, page, pageable.getPageSize(), totalElements, totalPages);
    }

    public VehicleEntryExitHistoryResponse getDetail(Long id, Long userId, String role) {
        ParkingSession session = parkingSessionReadRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Parking session history not found with ID: " + id));

        if ("DRIVER".equalsIgnoreCase(role)) {
            DriverProfileReadEntity driver = driverProfileReadRepository.findByUserId(userId)
                    .orElseThrow(() -> new EntityNotFoundException("Driver profile not found."));
            if (session.getDriverId() == null || !session.getDriverId().equals(driver.getId())) {
                throw new AccessDeniedException("Access denied to this parking history record.");
            }
        }

        return mapToResponse(session);
    }

    private VehicleEntryExitHistoryResponse mapToResponse(ParkingSession session) {
        List<ParkingSessionImage> images = parkingSessionImageReadRepository.findBySessionId(session.getId());
        String entryImageUrl = null;
        String exitImageUrl = null;

        for (ParkingSessionImage img : images) {
            if ("ENTRY_PLATE".equalsIgnoreCase(img.getImageType()) || "ENTRY_VEHICLE".equalsIgnoreCase(img.getImageType())) {
                if (entryImageUrl == null || "ENTRY_PLATE".equalsIgnoreCase(img.getImageType())) {
                    entryImageUrl = img.getImageUrl();
                }
            }
            if ("EXIT_PLATE".equalsIgnoreCase(img.getImageType()) || "EXIT_VEHICLE".equalsIgnoreCase(img.getImageType())) {
                if (exitImageUrl == null || "EXIT_PLATE".equalsIgnoreCase(img.getImageType())) {
                    exitImageUrl = img.getImageUrl();
                }
            }
        }

        BigDecimal fee = paymentReadRepository.findTopBySessionIdOrderByCreatedAtDesc(session.getId())
                .map(PaymentReadEntity::getTotalAmount)
                .orElse(BigDecimal.ZERO);

        Instant start = session.getEntryTime();
        Instant end = session.getExitTime() != null ? session.getExitTime() : Instant.now();
        String durationStr = formatDuration(start, end);

        String displayStatus = "DEPARTED";
        if ("ACTIVE".equalsIgnoreCase(session.getStatus())) {
            displayStatus = "IN_BUILDING";
        }

        return VehicleEntryExitHistoryResponse.builder()
                .id(session.getId())
                .driverId(session.getDriverId())
                .licensePlate(session.getPlateNumber())
                .vehicleType(session.getVehicleType() != null && Boolean.TRUE.equals(session.getVehicleType().getRequiresSlot()) ? "CAR" : "MOTORBIKE")
                .entryTime(session.getEntryTime() != null ? session.getEntryTime().atOffset(ZoneOffset.UTC) : null)
                .exitTime(session.getExitTime() != null ? session.getExitTime().atOffset(ZoneOffset.UTC) : null)
                .parkingDuration(durationStr)
                .parkingFee(fee)
                .status(displayStatus)
                .entryImageUrl(entryImageUrl)
                .exitImageUrl(exitImageUrl)
                .build();
    }

    private String formatDuration(Instant start, Instant end) {
        if (start == null || end == null) {
            return "00:00:00";
        }
        long seconds = Duration.between(start, end).getSeconds();
        if (seconds < 0) {
            seconds = 0;
        }
        long h = seconds / 3600;
        long m = (seconds % 3600) / 60;
        long s = seconds % 60;
        return String.format("%02d:%02d:%02d", h, m, s);
    }
}
