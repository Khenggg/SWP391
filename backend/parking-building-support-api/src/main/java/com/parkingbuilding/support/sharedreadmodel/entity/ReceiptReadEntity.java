package com.parkingbuilding.support.sharedreadmodel.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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
@Table(name = "receipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ReceiptReadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_code")
    private String receiptCode;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "card_code")
    private String cardCode;

    @Column(name = "plate_number")
    private String plateNumber;

    @Column(name = "vehicle_type_name")
    private String vehicleTypeName;

    @Column(name = "entry_time")
    private OffsetDateTime entryTime;

    @Column(name = "exit_time")
    private OffsetDateTime exitTime;

    private BigDecimal amount;

    @Column(name = "lost_card_fee")
    private BigDecimal lostCardFee;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "printed_count")
    private Integer printedCount;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
