package com.parkingbuilding.support.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OccupancyReportResponse {

    private long totalCapacity;

    private long occupied;

    private long reserved;

    private long available;

    private double occupancyRate;
}
