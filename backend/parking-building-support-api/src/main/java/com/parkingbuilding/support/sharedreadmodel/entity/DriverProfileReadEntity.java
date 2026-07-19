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
@Table(name = "driver_profiles")
public class DriverProfileReadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "driver_type", nullable = false)
    private String driverType;

    @Column(name = "apartment_number")
    private String apartmentNumber;

    @Column(name = "cccd_number")
    private String cccdNumber;

    @Column(name = "cccd_image_url")
    private String cccdImageUrl;

    @Column(name = "resident_verified", nullable = false)
    private Boolean residentVerified;

    @Column(name = "resident_verified_at")
    private OffsetDateTime residentVerifiedAt;

    @Column(name = "resident_verified_by")
    private Long residentVerifiedBy;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
