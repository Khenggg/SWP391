package com.parkingbuilding.support.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class CardSummaryResponse {

    private long available;

    private long inUse;

    private long lost;

    private long damaged;

    private long inactive;
}
