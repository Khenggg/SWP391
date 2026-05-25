package com.parkingbuilding.support.sharedreadmodel.entity;

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
@Table(name = "slots")

public class SlotReadEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "area_id", nullable = false)
    private Long areaId;

    @Column(name = "slot_code", nullable = false)
    private String slotCode;

    @Column(name = "allowed_vehicle_type_id", nullable = false)
    private Long allowedVehicleTypeId;

    @Column(name = "status")
    private String status;

    @Column(name = "current_session_id")
    private Long currentSessionId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updateAt;

}
