package com.parkingbuilding.support.sharedreadmodel.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "reservations")
public class ReservationReadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_code", nullable = false)
    private String reservationCode;

    @Column(name = "driver_id")
    private Long driverId;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "plate_number")
    private String plateNumber;

    @Column(name = "normalized_plate_number")
    private String normalizedPlateNumber;

    @Column(name = "vehicle_type_id", nullable = false)
    private Long vehicleTypeId;

    @Column(name = "floor_id", nullable = false)
    private Long floorId;

    @Column(name = "area_id", nullable = false)
    private Long areaId;

    @Column(name = "slot_id")
    private Long slotId;

    @Column(name = "pricing_rule_id")
    private Long pricingRuleId;

    @Column(name = "snapshot_reservation_hourly_price", nullable = false)
    private BigDecimal snapshotReservationHourlyPrice;

    @Column(name = "reserved_duration_minutes", nullable = false)
    private Integer reservedDurationMinutes;

    @Column(name = "booking_amount", nullable = false)
    private BigDecimal bookingAmount;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;

    @Column(name = "reserved_at", nullable = false)
    private OffsetDateTime reservedAt;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "payment_deadline")
    private OffsetDateTime paymentDeadline;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Column(name = "checked_in_at")
    private OffsetDateTime checkedInAt;

    @Column(name = "checked_in_by")
    private Long checkedInBy;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "cancelled_by")
    private Long cancelledBy;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
