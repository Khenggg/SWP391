package com.parkingbuilding.support.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RevenueReportResponse {

    private OffsetDateTime from;

    private OffsetDateTime to;

    private BigDecimal totalRevenue;

    private long totalPayments;

    private long paidPayments;

    private long pendingPayments;

    private long cancelledPayments;
}
