package com.parkingbuilding.support.dto.response;
public record ParkingInfoResponse(
        String name,
        String address,
        String openingHours,
        String status,
        String hotline,
        Integer totalCapacity
) {
}
