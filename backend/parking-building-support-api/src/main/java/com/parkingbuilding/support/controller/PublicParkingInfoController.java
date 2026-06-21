package com.parkingbuilding.support.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.response.ParkingInfoResponse;

@RestController
public class PublicParkingInfoController {

    @GetMapping("/api/public/parking-info")
    public ApiResponse<?> getParkingInfo() {

        ParkingInfoResponse data = new ParkingInfoResponse("Parking Building",
                "Q9",
                "24/7",
                "OPEN",
                "0123456789",
                500);
            return ApiResponse.ok(data);
    }
}
