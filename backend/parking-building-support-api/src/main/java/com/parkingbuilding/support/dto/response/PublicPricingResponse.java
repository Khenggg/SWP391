package com.parkingbuilding.support.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class PublicPricingResponse {

    private Long pricingRuleId;

    private Long vehicleTypeId;

    private String vehicleTypeName;

    private BigDecimal dayPrice;

    private BigDecimal nightPrice;

    private BigDecimal monthlyPrice;

    private BigDecimal reservationHourlyPrice;

    private Integer maxReservationHours;

    private BigDecimal lostCardFee;
}
