package com.parkingbuilding.support.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private SlotSummaryResponse slot;

    private TrafficSummaryResponse traffic;

    private RevenueSummaryResponse revenue;

    private CardSummaryResponse card;

    private PendingSummaryResponse pending;
}
