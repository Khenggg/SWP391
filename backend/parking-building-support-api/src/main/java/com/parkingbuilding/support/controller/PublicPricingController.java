package com.parkingbuilding.support.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.service.PublicPricingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicPricingController {

    private final PublicPricingService service;

    @GetMapping("/pricing")
    public ApiResponse<?> getPricing() {

        return ApiResponse.ok(
                service.getPricing()
        );
    }
}
