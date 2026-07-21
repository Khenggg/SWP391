package com.parkingbuilding.support.dto.response;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public record VehicleHistoryPagedResponse(
    List<VehicleEntryExitHistoryResponse> items,
    int page,
    @JsonProperty("pageSize") int pageSize,
    @JsonProperty("totalItems") long totalItems,
    @JsonProperty("totalPages") int totalPages
) {}
