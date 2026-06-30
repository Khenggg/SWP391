package com.parkingbuilding.support.dto.response;

import java.time.Instant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SessionReportItemResponse {

    private String sessionCode;

    private Long cardId;

    private String plateNumber;

    private String status;

    private Instant entryTime;

}
