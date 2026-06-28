package com.parkingbuilding.support.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.dto.request.TrafficReportRequest;
import com.parkingbuilding.support.dto.response.TrafficReportResponse;
import com.parkingbuilding.support.service.TrafficReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports/traffic")
@RequiredArgsConstructor
public class TrafficReportController {

    private final TrafficReportService service;

    @GetMapping
    public ResponseEntity<TrafficReportResponse> getReport(
            TrafficReportRequest request) {

        return ResponseEntity.ok(
                service.getReport(request));
    }
}
