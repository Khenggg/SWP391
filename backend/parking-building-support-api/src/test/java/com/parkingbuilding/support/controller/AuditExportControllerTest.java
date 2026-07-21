package com.parkingbuilding.support.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.parkingbuilding.support.service.AuditExportService;

@WebMvcTest(AuditExportController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuditExportControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditExportService auditExportService;

    @Test
    void exportAuditLogs_shouldReturnExcelFile() throws Exception {

        byte[] excel = "excel-data".getBytes(StandardCharsets.UTF_8);

        when(auditExportService.exportAuditLogs())
                .thenReturn(excel);

        mockMvc.perform(get("/api/audit-logs/export"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Content-Disposition",
                        "attachment; filename=audit_logs.xlsx"))
                .andExpect(header().string(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(content().bytes(excel));

        verify(auditExportService).exportAuditLogs();
    }

    @Test
    void exportAuditLogs_shouldReturnCorrectContentType() throws Exception {

        when(auditExportService.exportAuditLogs())
                .thenReturn(new byte[0]);

        mockMvc.perform(get("/api/audit-logs/export"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        verify(auditExportService).exportAuditLogs();
    }

    @Test
    void exportAuditLogs_shouldReturnAttachmentHeader() throws Exception {

        when(auditExportService.exportAuditLogs())
                .thenReturn(new byte[0]);

        mockMvc.perform(get("/api/audit-logs/export"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Content-Disposition",
                        "attachment; filename=audit_logs.xlsx"));

        verify(auditExportService).exportAuditLogs();
    }
}
