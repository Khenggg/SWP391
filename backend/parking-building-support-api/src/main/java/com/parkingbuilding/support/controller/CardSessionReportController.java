package com.parkingbuilding.support.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.response.CardSessionReportResponse;
import com.parkingbuilding.support.service.CardSessionReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support/reports/card-session")
@RequiredArgsConstructor
public class CardSessionReportController {

    private final CardSessionReportService service;

    @GetMapping
    public ApiResponse<CardSessionReportResponse> getReport() {

        return ApiResponse.ok(
                service.getReport());
    }
}
