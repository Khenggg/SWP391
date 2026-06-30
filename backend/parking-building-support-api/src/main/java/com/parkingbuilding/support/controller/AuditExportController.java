package com.parkingbuilding.support.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.service.AuditExportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditExportController {
    private final AuditExportService auditExportService;

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAuditLogs() throws IOException {

        byte[] file = auditExportService.exportAuditLogs();

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=audit_logs.xlsx")
                .header("Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(file);
    }

}
