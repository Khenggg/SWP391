package com.parkingbuilding.support.sharedreadmodel.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "gates")
public class GateReadEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "floor_id", nullable = false)
    private Long floorId;

    @Column(name = "gate_code", nullable = false)
    private String gateCode;

    @Column(name = "gate_type", nullable = false)
    private String gate_type;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

}
