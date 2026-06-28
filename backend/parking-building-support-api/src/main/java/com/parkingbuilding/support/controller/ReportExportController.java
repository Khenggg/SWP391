package com.parkingbuilding.support.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.dto.request.RevenueReportRequest;
import com.parkingbuilding.support.service.ReportExportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support/reports")
@RequiredArgsConstructor

public class ReportExportController {
    private final ReportExportService reportExportService;

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReport(
            RevenueReportRequest request) throws IOException {

        byte[] file = reportExportService.exportReport(request);

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=reports.xlsx")
                .header("Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(file);
    }
}
