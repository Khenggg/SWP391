package com.parkingbuilding.support.sharedreadmodel.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "floors")
public class FloorReadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "floor_code", nullable = false)
    private String floorCode;

    @Column(name = "floor_name", nullable = false)
    private String floorName;

    @Column(name = "status")
    private String status; // ACTIVE, LOCKED, MAINTENANCE

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
