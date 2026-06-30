package com.parkingbuilding.support.sharedreadmodel.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "plate_mismatch_cases")

public class PlateMismatchCaseReadEntity {

    @Id
    private Long id;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "entry_plate_number")
    private String entryPlateNumber;

    @Column(name = "exit_plate_number")
    private String exitPlateNumber;

    private String reason;

    private String status;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "confirmed_by")
    private Long confirmedBy;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
