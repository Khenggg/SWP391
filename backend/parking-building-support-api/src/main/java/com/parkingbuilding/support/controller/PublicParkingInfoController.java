package com.parkingbuilding.support.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.response.ParkingInfoResponse;

@RestController
public class PublicParkingInfoController {

    @GetMapping("/api/public/parking-info")
    public ApiResponse<?> getParkingInfo() {
        // Map<String, Object> data = Map.of(
        //         "name", "Parking Building",
        //         "address", "Q9",
        //         "openingHours", "24/7",
        //         "status", "OPEN",
        //         "hotline", "0123456789",
        //         "totalCapacity", 500);
        //     return ApiResponse.ok(data);

        ParkingInfoResponse data = new ParkingInfoResponse("Parking Building",
                "Q9",
                "24/7",
                "OPEN",
                "0123456789",
                500);
            return ApiResponse.ok(data);
    }
}
