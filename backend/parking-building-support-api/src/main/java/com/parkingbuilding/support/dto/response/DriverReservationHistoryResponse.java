package com.parkingbuilding.support.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DriverReservationHistoryResponse {
    List<ReservationHistoryItemResponse> items;
}
