package com.parkingbuilding.support.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.response.ParkingInfoResponse;
import com.parkingbuilding.support.sharedreadmodel.repository.AreaReadRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PublicParkingInfoController {

    private final AreaReadRepository areaReadRepository;

    @GetMapping("/api/public/parking-info")
    public ApiResponse<?> getParkingInfo() {

        Integer totalCapacity = areaReadRepository.sumTotalCapacity();

        ParkingInfoResponse data = new ParkingInfoResponse("Parking Building",
                "Q9",
                "24/7",
                "OPEN",
                "0123456789",
                totalCapacity);
            return ApiResponse.ok(data);
    }
}
