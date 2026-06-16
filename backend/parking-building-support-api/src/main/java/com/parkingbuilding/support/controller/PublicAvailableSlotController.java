package com.parkingbuilding.support.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.service.AvailableSlotService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/public")
public class PublicAvailableSlotController {

    private final AvailableSlotService availableSlotService;

    @GetMapping("/available-slots")
    public ApiResponse<?> getAvailableSlots(
            @RequestParam(required = false) Long vehicleTypeId,
            @RequestParam(required = false) Long areaId,
            @RequestParam(required = false) Long floorId) {
        System.out.println("Controller OK");
        return ApiResponse.ok(
                availableSlotService.getAvailableSlots(
                        vehicleTypeId,
                        areaId,
                        floorId
                ));
    }

}
