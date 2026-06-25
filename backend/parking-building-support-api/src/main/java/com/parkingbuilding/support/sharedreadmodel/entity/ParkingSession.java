package com.parkingbuilding.support.sharedreadmodel.entity;

import java.time.Instant;

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
@Table(name = "parking_sessions")

public class ParkingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_code")
    private String sessionCode;

    @Column(name = "card_id")
    private Long cardId;

    @Column(name = "driver_id")
    private Long driverId;

    @Column(name = "vehicle_type_id")
    private Long vehicleTypeId;

    @Column(name = "plate_number")
    private String plateNumber;

    @Column(name = "normalized_plate_number")
    private String normalizedPlateNumber;

    @Column(name = "status")
    private String status;

    @Column(name = "entry_time")
    private Instant entryTime;

    @Column(name = "slot_id")
    private Long slotId;

    @Column(name = "area_id")
    private Long areaId;

    @Column(name = "pricing_rule_id")
    private Long pricingRuleId;
}
