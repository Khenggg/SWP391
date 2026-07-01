package com.parkingbuilding.support.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ActiveReservationResponse {
    Long id;
    String reservationCode;
    String status;
    String paymentStatus;
    BigDecimal bookingAmount;
    String plateNumber;
    Long vehicleTypeId;
    Long floorId;
    Long areaId;
    String areaName;
    Long slotId;
    String slotName;
    OffsetDateTime reservedAt;
    OffsetDateTime reservationEndTime;
    OffsetDateTime paymentDeadline;
    OffsetDateTime confirmedAt;
    OffsetDateTime checkedInAt;
    Long paymentId;
    String provider;
    String providerTransactionId;
    String checkoutUrl;
    String qrCode;
    OffsetDateTime paymentExpiredAt;
    Integer remainingSeconds;
}
