package com.parkingbuilding.support.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class TrafficSummaryResponse {

    private long entriesToday;

    private long exitsToday;

    private long activeSessions;
}
