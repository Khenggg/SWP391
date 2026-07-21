package com.parkingbuilding.support.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VehicleEntryExitHistoryResponse {
    private Long id;
    private Long driverId;
    private String licensePlate;
    private String vehicleType;
    private OffsetDateTime entryTime;
    private OffsetDateTime exitTime;
    private String parkingDuration;
    private BigDecimal parkingFee;
    private String status; // DEPARTED, IN_BUILDING
    private String entryImageUrl;
    private String exitImageUrl;
}
