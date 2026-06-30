package com.parkingbuilding.support.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.dto.response.OccupancyReportResponse;
import com.parkingbuilding.support.service.OccupancyReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support/reports/occupancy")
@RequiredArgsConstructor
public class OccupancyReportController {

    private final OccupancyReportService service;

    @GetMapping
    public ResponseEntity<OccupancyReportResponse> getReport() {
        return ResponseEntity.ok(service.getReport());
    }
}
