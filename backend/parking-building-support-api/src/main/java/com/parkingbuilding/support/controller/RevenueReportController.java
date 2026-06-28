package com.parkingbuilding.support.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.dto.request.RevenueReportRequest;
import com.parkingbuilding.support.dto.response.RevenueReportResponse;
import com.parkingbuilding.support.service.RevenueReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support/reports/revenue")
@RequiredArgsConstructor

public class RevenueReportController {

    private final RevenueReportService revenueReportService;

    @GetMapping
    public ResponseEntity<RevenueReportResponse> getRevenueReport(
            RevenueReportRequest request) {

        return ResponseEntity.ok(
                revenueReportService.getReport(request));
    }
}
