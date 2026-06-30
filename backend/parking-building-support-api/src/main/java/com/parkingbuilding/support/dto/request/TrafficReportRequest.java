package com.parkingbuilding.support.dto.request;

import java.time.OffsetDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TrafficReportRequest {

    private OffsetDateTime from;

    private OffsetDateTime to;
}
