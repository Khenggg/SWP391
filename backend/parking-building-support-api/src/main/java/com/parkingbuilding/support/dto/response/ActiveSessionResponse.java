package com.parkingbuilding.support.dto.response;


import java.math.BigDecimal;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveSessionResponse {

    private String cardCode;
    private String sessionCode;
    private String maskedPlateNumber;
    private String vehicleType;

    private Instant entryTime;
    private BigDecimal temporaryFeePreview;

    private String status;
}
