package com.parkingbuilding.support.sharedreadmodel.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class PaymentReadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "monthly_pass_id")
    private Long monthlyPassId;

    private BigDecimal amount;

    @Column(name = "lost_card_fee")
    private BigDecimal lostCardFee;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    private String purpose;

    private String method;

    private String status;

    private String provider;

    @Column(name = "provider_transaction_id")
    private String providerTransactionId;

    @Column(name = "payment_url")
    private String paymentUrl;

    @Column(name = "expired_at")
    private OffsetDateTime expiredAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "gateway_payload", columnDefinition = "jsonb")
    private String gatewayPayload;

    @Column(name = "paid_by_user_id")
    private Long paidByUserId;

    @Column(name = "received_amount")
    private BigDecimal receivedAmount;

    @Column(name = "fee_calculated_at")
    private OffsetDateTime feeCalculatedAt;

    @Column(name = "payment_valid_until")
    private OffsetDateTime paymentValidUntil;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "collected_by")
    private Long collectedBy;

    @Column(name = "waive_reason")
    private String waiveReason;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
