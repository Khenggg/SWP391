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
@Table(name = "pricing_rules")
public class PricingRuleReadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_type_id", nullable = false)
    private Long vehicleTypeId;

    @Column(name = "day_price", nullable = false)
    private BigDecimal dayPrice;

    @Column(name = "night_price", nullable = false)
    private BigDecimal nightPrice;

    @Column(name = "monthly_price", nullable = false)
    private BigDecimal monthlyPrice;

    @Column(name = "lost_card_fee")
    private BigDecimal lostCardFee;

    @Column(name = "effective_from")
    private OffsetDateTime effectiveFrom;

    @Column(name = "status")
    private String status; // ACTIVE, INACTIVE

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "reservation_hourly_price")
    private BigDecimal reservationHourlyPrice;
}
