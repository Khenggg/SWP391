package com.parkingbuilding.support.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class PendingSummaryResponse {

    private long lostCardPending;

    private long plateMismatchPending;

    private long totalPending;
}
