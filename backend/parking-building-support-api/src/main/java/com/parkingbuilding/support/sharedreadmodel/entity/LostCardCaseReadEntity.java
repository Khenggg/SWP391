package com.parkingbuilding.support.sharedreadmodel.entity;

import java.math.BigDecimal;
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
@Table(name = "lost_card_cases")

public class LostCardCaseReadEntity {

    @Id
    private Long id;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "card_id")
    private Long cardId;

    @Column(name = "reporter_name")
    private String reporterName;

    private String phone;

    @Column(name = "verification_note")
    private String verificationNote;

    private String reason;

    @Column(name = "lost_card_fee")
    private BigDecimal lostCardFee;

    private String status;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
