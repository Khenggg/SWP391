package com.parkingbuilding.support.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<?> getStats() {
        return ApiResponse.ok(
                dashboardService.getStats()
        );
    }
}