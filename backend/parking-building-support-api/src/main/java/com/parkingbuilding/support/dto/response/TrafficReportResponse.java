package com.parkingbuilding.support.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class TrafficReportResponse {

    private long totalEntries;

    private long totalExits;

    private long activeSessions;

    private long completedSessions;
}
