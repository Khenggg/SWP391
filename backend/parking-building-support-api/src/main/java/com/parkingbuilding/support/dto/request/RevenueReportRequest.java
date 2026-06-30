package com.parkingbuilding.support.dto.request;

import java.time.OffsetDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RevenueReportRequest {

    private OffsetDateTime from;

    private OffsetDateTime to;
}
