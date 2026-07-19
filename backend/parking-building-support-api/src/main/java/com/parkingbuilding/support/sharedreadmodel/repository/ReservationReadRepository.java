package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.ReservationReadEntity;

@Repository
public interface ReservationReadRepository extends ReadOnlyRepository<ReservationReadEntity, Long> {

    List<ReservationReadEntity> findByDriverIdAndStatusInOrderByCreatedAtDesc(
            Long driverId,
            Collection<String> statuses);

    List<ReservationReadEntity> findByDriverIdOrderByCreatedAtDesc(Long driverId);

    List<ReservationReadEntity> findByDriverIdOrderByCreatedAtDesc(Long driverId, Pageable pageable);

    @Query(value = """
            SELECT
                r.id AS "id",
                r.reservation_code AS "reservationCode",
                r.status AS "status",
                r.payment_status AS "paymentStatus",
                r.booking_amount AS "bookingAmount",
                r.plate_number AS "plateNumber",
                r.vehicle_type_id AS "vehicleTypeId",
                r.floor_id AS "floorId",
                r.area_id AS "areaId",
                a.area_name AS "areaName",
                r.slot_id AS "slotId",
                s.slot_code AS "slotName",
                r.reserved_at AS "reservedAt",
                r.expires_at AS "reservationEndTime",
                r.payment_deadline AS "paymentDeadline",
                r.confirmed_at AS "confirmedAt",
                r.checked_in_at AS "checkedInAt",
                r.cancelled_at AS "cancelledAt",
                r.created_at AS "createdAt",
                r.updated_at AS "updatedAt",
                p.id AS "paymentId",
                p.provider AS "provider",
                p.provider_transaction_id AS "providerTransactionId",
                p.payment_url AS "checkoutUrl",
                p.gateway_payload::text AS "gatewayPayload",
                p.expired_at AS "paymentExpiredAt"
            FROM reservations r
            JOIN driver_profiles dp ON dp.id = r.driver_id
            LEFT JOIN areas a ON a.id = r.area_id
            LEFT JOIN slots s ON s.id = r.slot_id
            LEFT JOIN LATERAL (
                SELECT p0.*
                FROM payments p0
                WHERE p0.reservation_id = r.id
                ORDER BY p0.created_at DESC
                LIMIT 1
            ) p ON true
            WHERE dp.user_id = :userId
              AND r.status <> 'CANCELLED'
            ORDER BY r.created_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<ReservationDetailRow> findReservationHistoryDetailsByUserId(
            @Param("userId") Long userId,
            @Param("limit") int limit);

    @Query(value = """
            SELECT
                r.id AS "id",
                r.reservation_code AS "reservationCode",
                r.status AS "status",
                r.payment_status AS "paymentStatus",
                r.booking_amount AS "bookingAmount",
                r.plate_number AS "plateNumber",
                r.vehicle_type_id AS "vehicleTypeId",
                r.floor_id AS "floorId",
                r.area_id AS "areaId",
                a.area_name AS "areaName",
                r.slot_id AS "slotId",
                s.slot_code AS "slotName",
                r.reserved_at AS "reservedAt",
                r.expires_at AS "reservationEndTime",
                r.payment_deadline AS "paymentDeadline",
                r.confirmed_at AS "confirmedAt",
                r.checked_in_at AS "checkedInAt",
                r.cancelled_at AS "cancelledAt",
                r.created_at AS "createdAt",
                r.updated_at AS "updatedAt",
                p.id AS "paymentId",
                p.provider AS "provider",
                p.provider_transaction_id AS "providerTransactionId",
                p.payment_url AS "checkoutUrl",
                p.gateway_payload::text AS "gatewayPayload",
                p.expired_at AS "paymentExpiredAt"
            FROM reservations r
            JOIN driver_profiles dp ON dp.id = r.driver_id
            LEFT JOIN areas a ON a.id = r.area_id
            LEFT JOIN slots s ON s.id = r.slot_id
            LEFT JOIN LATERAL (
                SELECT p0.*
                FROM payments p0
                WHERE p0.reservation_id = r.id
                ORDER BY p0.created_at DESC
                LIMIT 1
            ) p ON true
            WHERE dp.user_id = :userId
              AND r.status IN ('PENDING', 'CONFIRMED')
              AND COALESCE(r.payment_status, '') NOT IN ('FAILED', 'CANCELLED', 'WAIVED', 'NOT_REQUIRED')
              AND (
                    (r.status = 'PENDING' AND (r.payment_deadline IS NULL OR r.payment_deadline > now()))
                 OR (r.status = 'CONFIRMED' AND r.expires_at > now())
              )
            ORDER BY
                CASE WHEN r.status = 'CONFIRMED' THEN 0 ELSE 1 END,
                r.created_at DESC
            LIMIT 1
            """, nativeQuery = true)
    Optional<ReservationDetailRow> findActiveReservationDetailByUserId(@Param("userId") Long userId);

    interface ReservationDetailRow {
        Long getId();
        String getReservationCode();
        String getStatus();
        String getPaymentStatus();
        java.math.BigDecimal getBookingAmount();
        String getPlateNumber();
        Long getVehicleTypeId();
        Long getFloorId();
        Long getAreaId();
        String getAreaName();
        Long getSlotId();
        String getSlotName();
        java.time.Instant getReservedAt();
        java.time.Instant getReservationEndTime();
        java.time.Instant getPaymentDeadline();
        java.time.Instant getConfirmedAt();
        java.time.Instant getCheckedInAt();
        java.time.Instant getCancelledAt();
        java.time.Instant getCreatedAt();
        java.time.Instant getUpdatedAt();
        Long getPaymentId();
        String getProvider();
        String getProviderTransactionId();
        String getCheckoutUrl();
        String getGatewayPayload();
        java.time.Instant getPaymentExpiredAt();
    }
}
