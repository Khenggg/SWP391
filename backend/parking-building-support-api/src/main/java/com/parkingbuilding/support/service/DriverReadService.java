package com.parkingbuilding.support.service;

import java.io.IOException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkingbuilding.support.dto.response.ActiveReservationResponse;
import com.parkingbuilding.support.dto.response.DriverReservationHistoryResponse;
import com.parkingbuilding.support.dto.response.DriverProfileResponse;
import com.parkingbuilding.support.dto.response.ReservationHistoryItemResponse;
import com.parkingbuilding.support.sharedreadmodel.entity.AreaReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.DriverProfileReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.PaymentReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.ReservationReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.SlotReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.UserReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AreaReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.DriverProfileReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.DriverProfileReadRepository.DriverProfileRow;
import com.parkingbuilding.support.sharedreadmodel.repository.PaymentReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.ReservationReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.ReservationReadRepository.ReservationDetailRow;
import com.parkingbuilding.support.sharedreadmodel.repository.SlotReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.UserReadRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DriverReadService {

    private static final Set<String> ACTIVE_RESERVATION_STATUSES = Set.of("PENDING", "CONFIRMED");
    private static final Set<String> TERMINAL_PAYMENT_STATUSES = Set.of("FAILED", "CANCELLED", "WAIVED", "NOT_REQUIRED");

    private final UserReadRepository userReadRepository;
    private final DriverProfileReadRepository driverProfileReadRepository;
    private final ReservationReadRepository reservationReadRepository;
    private final PaymentReadRepository paymentReadRepository;
    private final AreaReadRepository areaReadRepository;
    private final SlotReadRepository slotReadRepository;
    private final ObjectMapper objectMapper;

    public DriverProfileResponse getDriverProfile(Long userId, String username) {
        DriverProfileRow profile = driverProfileReadRepository
                .findCurrentDriverProfile(userId, username)
                .orElseThrow(() -> new EntityNotFoundException("Unable to resolve authenticated user."));

        return toDriverProfileResponse(profile);
    }

    public ActiveReservationResponse getActiveReservation(Long userId, String username) {
        Long effectiveUserId = resolveEffectiveUserId(userId, username);

        return reservationReadRepository
                .findActiveReservationDetailByUserId(effectiveUserId)
                .map(this::toActiveReservationResponse)
                .orElse(null);
    }

    public DriverReservationHistoryResponse getReservationHistory(Long userId, String username, Integer limit) {
        Long effectiveUserId = resolveEffectiveUserId(userId, username);

        int safeLimit = limit == null || limit <= 0 ? 20 : Math.min(limit, 100);

        List<ReservationHistoryItemResponse> items = reservationReadRepository
                .findReservationHistoryDetailsByUserId(effectiveUserId, safeLimit)
                .stream()
                .map(this::toReservationHistoryItemResponse)
                .collect(Collectors.toList());

        return DriverReservationHistoryResponse.builder()
                .items(items)
                .build();
    }

    private Long resolveEffectiveUserId(Long userId, String username) {
        if (userId != null) {
            return userId;
        }
        return resolveUser(null, username).getId();
    }

    private DriverProfileResponse toDriverProfileResponse(DriverProfileRow profile) {
        return DriverProfileResponse.builder()
                .driverId(profile.getDriverId())
                .userId(profile.getUserId())
                .username(profile.getUsername())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .email(profile.getEmail())
                .status(profile.getStatus())
                .driverType(profile.getDriverType())
                .apartmentNumber(profile.getApartmentNumber())
                .residentVerified(Boolean.TRUE.equals(profile.getResidentVerified()))
                .residentVerifiedAt(toOffsetDateTime(profile.getResidentVerifiedAt()))
                .createdAt(toOffsetDateTime(profile.getCreatedAt()))
                .updatedAt(toOffsetDateTime(profile.getUpdatedAt()))
                .build();
    }

    private UserReadEntity resolveUser(Long userId, String username) {
        if (userId != null) {
            return userReadRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found for current token."));
        }

        if (username != null && !username.isBlank()) {
            UserReadEntity user = userReadRepository.findByUsername(username);
            if (user != null) {
                return user;
            }
        }

        throw new EntityNotFoundException("Unable to resolve authenticated user.");
    }

    private boolean isActiveReservation(ReservationReadEntity reservation, OffsetDateTime now) {
        if (reservation == null || TERMINAL_PAYMENT_STATUSES.contains(reservation.getPaymentStatus())) {
            return false;
        }

        if ("PENDING".equalsIgnoreCase(reservation.getStatus())) {
            OffsetDateTime pendingDeadline = reservation.getPaymentDeadline();
            return pendingDeadline == null || pendingDeadline.isAfter(now);
        }

        if ("CONFIRMED".equalsIgnoreCase(reservation.getStatus())) {
            return reservation.getExpiresAt() != null && reservation.getExpiresAt().isAfter(now);
        }

        return false;
    }

    private boolean isConfirmedReservation(ReservationReadEntity reservation) {
        return reservation != null && "CONFIRMED".equalsIgnoreCase(reservation.getStatus());
    }

    private ActiveReservationResponse toActiveReservationResponse(ReservationReadEntity reservation) {
        AreaReadEntity area = areaReadRepository.findById(reservation.getAreaId()).orElse(null);
        SlotReadEntity slot = reservation.getSlotId() != null
                ? slotReadRepository.findById(reservation.getSlotId()).orElse(null)
                : null;
        PaymentReadEntity payment = paymentReadRepository
                .findTopByReservationIdOrderByCreatedAtDesc(reservation.getId())
                .orElse(null);

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime pendingDeadline = reservation.getPaymentDeadline() != null
                ? reservation.getPaymentDeadline()
                : payment != null ? payment.getExpiredAt() : null;

        Integer remainingSeconds = null;
        if (pendingDeadline != null && "PENDING".equalsIgnoreCase(reservation.getPaymentStatus())) {
            remainingSeconds = Math.max(0, (int) java.time.Duration.between(now, pendingDeadline).getSeconds());
        }

        boolean exposePendingPaymentData = payment != null && "PENDING".equalsIgnoreCase(payment.getStatus());

        return ActiveReservationResponse.builder()
                .id(reservation.getId())
                .reservationCode(reservation.getReservationCode())
                .status(reservation.getStatus())
                .paymentStatus(reservation.getPaymentStatus())
                .bookingAmount(reservation.getBookingAmount())
                .plateNumber(reservation.getPlateNumber())
                .vehicleTypeId(reservation.getVehicleTypeId())
                .floorId(reservation.getFloorId())
                .areaId(reservation.getAreaId())
                .areaName(area != null ? area.getAreaName() : null)
                .slotId(reservation.getSlotId())
                .slotName(slot != null ? slot.getSlotCode() : null)
                .reservedAt(reservation.getReservedAt())
                .reservationEndTime(reservation.getExpiresAt())
                .paymentDeadline(reservation.getPaymentDeadline())
                .confirmedAt(reservation.getConfirmedAt())
                .checkedInAt(reservation.getCheckedInAt())
                .paymentId(payment != null ? payment.getId() : null)
                .provider(payment != null ? payment.getProvider() : null)
                .providerTransactionId(payment != null ? payment.getProviderTransactionId() : null)
                .checkoutUrl(exposePendingPaymentData ? payment.getPaymentUrl() : null)
                .qrCode(exposePendingPaymentData ? extractQrCode(payment.getGatewayPayload()) : null)
                .paymentExpiredAt(payment != null ? payment.getExpiredAt() : null)
                .remainingSeconds(remainingSeconds)
                .build();
    }

    private ActiveReservationResponse toActiveReservationResponse(ReservationDetailRow reservation) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime pendingDeadline = reservation.getPaymentDeadline() != null
                ? toOffsetDateTime(reservation.getPaymentDeadline())
                : toOffsetDateTime(reservation.getPaymentExpiredAt());

        Integer remainingSeconds = null;
        if (pendingDeadline != null && "PENDING".equalsIgnoreCase(reservation.getPaymentStatus())) {
            remainingSeconds = Math.max(0, (int) java.time.Duration.between(now, pendingDeadline).getSeconds());
        }

        boolean exposePendingPaymentData = "PENDING".equalsIgnoreCase(reservation.getPaymentStatus());

        return ActiveReservationResponse.builder()
                .id(reservation.getId())
                .reservationCode(reservation.getReservationCode())
                .status(reservation.getStatus())
                .paymentStatus(reservation.getPaymentStatus())
                .bookingAmount(reservation.getBookingAmount())
                .plateNumber(reservation.getPlateNumber())
                .vehicleTypeId(reservation.getVehicleTypeId())
                .floorId(reservation.getFloorId())
                .areaId(reservation.getAreaId())
                .areaName(reservation.getAreaName())
                .slotId(reservation.getSlotId())
                .slotName(reservation.getSlotName())
                .reservedAt(toOffsetDateTime(reservation.getReservedAt()))
                .reservationEndTime(toOffsetDateTime(reservation.getReservationEndTime()))
                .paymentDeadline(toOffsetDateTime(reservation.getPaymentDeadline()))
                .confirmedAt(toOffsetDateTime(reservation.getConfirmedAt()))
                .checkedInAt(toOffsetDateTime(reservation.getCheckedInAt()))
                .paymentId(reservation.getPaymentId())
                .provider(reservation.getProvider())
                .providerTransactionId(reservation.getProviderTransactionId())
                .checkoutUrl(exposePendingPaymentData ? reservation.getCheckoutUrl() : null)
                .qrCode(exposePendingPaymentData ? extractQrCode(reservation.getGatewayPayload()) : null)
                .paymentExpiredAt(toOffsetDateTime(reservation.getPaymentExpiredAt()))
                .remainingSeconds(remainingSeconds)
                .build();
    }

    private ReservationHistoryItemResponse toReservationHistoryItemResponse(ReservationReadEntity reservation) {
        AreaReadEntity area = areaReadRepository.findById(reservation.getAreaId()).orElse(null);
        SlotReadEntity slot = reservation.getSlotId() != null
                ? slotReadRepository.findById(reservation.getSlotId()).orElse(null)
                : null;
        PaymentReadEntity payment = paymentReadRepository
                .findTopByReservationIdOrderByCreatedAtDesc(reservation.getId())
                .orElse(null);

        return toReservationHistoryItemResponse(reservation, area, slot, payment);
    }

    private ReservationHistoryItemResponse toReservationHistoryItemResponse(
            ReservationReadEntity reservation,
            AreaReadEntity area,
            SlotReadEntity slot,
            PaymentReadEntity payment) {
        return ReservationHistoryItemResponse.builder()
                .id(reservation.getId())
                .reservationCode(reservation.getReservationCode())
                .status(reservation.getStatus())
                .paymentStatus(reservation.getPaymentStatus())
                .bookingAmount(reservation.getBookingAmount())
                .plateNumber(reservation.getPlateNumber())
                .vehicleTypeId(reservation.getVehicleTypeId())
                .floorId(reservation.getFloorId())
                .areaId(reservation.getAreaId())
                .areaName(area != null ? area.getAreaName() : null)
                .slotId(reservation.getSlotId())
                .slotName(slot != null ? slot.getSlotCode() : null)
                .reservedAt(reservation.getReservedAt())
                .reservationEndTime(reservation.getExpiresAt())
                .paymentDeadline(reservation.getPaymentDeadline())
                .confirmedAt(reservation.getConfirmedAt())
                .checkedInAt(reservation.getCheckedInAt())
                .cancelledAt(reservation.getCancelledAt())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .paymentId(payment != null ? payment.getId() : null)
                .provider(payment != null ? payment.getProvider() : null)
                .providerTransactionId(payment != null ? payment.getProviderTransactionId() : null)
                .build();
    }

    private ReservationHistoryItemResponse toReservationHistoryItemResponse(ReservationDetailRow reservation) {
        return ReservationHistoryItemResponse.builder()
                .id(reservation.getId())
                .reservationCode(reservation.getReservationCode())
                .status(reservation.getStatus())
                .paymentStatus(reservation.getPaymentStatus())
                .bookingAmount(reservation.getBookingAmount())
                .plateNumber(reservation.getPlateNumber())
                .vehicleTypeId(reservation.getVehicleTypeId())
                .floorId(reservation.getFloorId())
                .areaId(reservation.getAreaId())
                .areaName(reservation.getAreaName())
                .slotId(reservation.getSlotId())
                .slotName(reservation.getSlotName())
                .reservedAt(toOffsetDateTime(reservation.getReservedAt()))
                .reservationEndTime(toOffsetDateTime(reservation.getReservationEndTime()))
                .paymentDeadline(toOffsetDateTime(reservation.getPaymentDeadline()))
                .confirmedAt(toOffsetDateTime(reservation.getConfirmedAt()))
                .checkedInAt(toOffsetDateTime(reservation.getCheckedInAt()))
                .cancelledAt(toOffsetDateTime(reservation.getCancelledAt()))
                .createdAt(toOffsetDateTime(reservation.getCreatedAt()))
                .updatedAt(toOffsetDateTime(reservation.getUpdatedAt()))
                .paymentId(reservation.getPaymentId())
                .provider(reservation.getProvider())
                .providerTransactionId(reservation.getProviderTransactionId())
                .build();
    }

    private OffsetDateTime toOffsetDateTime(Instant value) {
        return value != null ? value.atOffset(ZoneOffset.UTC) : null;
    }

    private String extractQrCode(String gatewayPayload) {
        if (gatewayPayload == null || gatewayPayload.isBlank()) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(gatewayPayload);
            JsonNode qrNode = root.get("qrCode");
            return qrNode != null && !qrNode.isNull() ? qrNode.asText() : null;
        } catch (IOException ex) {
            return null;
        }
    }
}
