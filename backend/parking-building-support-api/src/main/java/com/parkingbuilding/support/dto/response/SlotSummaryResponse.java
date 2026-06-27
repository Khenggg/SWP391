package com.parkingbuilding.support.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class SlotSummaryResponse {

    private long total;

    private long available;

    private long occupied;

    private long reserved;

    private long locked;

    private long maintenance;
}
