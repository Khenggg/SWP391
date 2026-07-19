package com.parkingbuilding.support.controller;

import static org.mockito.ArgumentMatchers.any;
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

import com.parkingbuilding.support.dto.request.RevenueReportRequest;
import com.parkingbuilding.support.service.ReportExportService;

@WebMvcTest(ReportExportController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ReportExportControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportExportService reportExportService;

    @Test
    void exportReport_shouldReturnExcelFile() throws Exception {

        byte[] excel = "report-data".getBytes(StandardCharsets.UTF_8);

        when(reportExportService.exportReport(any(RevenueReportRequest.class)))
                .thenReturn(excel);

        mockMvc.perform(get("/api/support/reports/export"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Content-Disposition",
                        "attachment; filename=reports.xlsx"))
                .andExpect(header().string(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(content().bytes(excel));

        verify(reportExportService).exportReport(any(RevenueReportRequest.class));
    }

    @Test
    void exportReport_shouldReturnCorrectContentType() throws Exception {

        when(reportExportService.exportReport(any(RevenueReportRequest.class)))
                .thenReturn(new byte[0]);

        mockMvc.perform(get("/api/support/reports/export"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        verify(reportExportService).exportReport(any(RevenueReportRequest.class));
    }

    @Test
    void exportReport_shouldReturnAttachmentHeader() throws Exception {

        when(reportExportService.exportReport(any(RevenueReportRequest.class)))
                .thenReturn(new byte[0]);

        mockMvc.perform(get("/api/support/reports/export"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Content-Disposition",
                        "attachment; filename=reports.xlsx"));

        verify(reportExportService).exportReport(any(RevenueReportRequest.class));
    }

    @Test
    void exportReport_withRequestParams_shouldReturn200() throws Exception {

        when(reportExportService.exportReport(any(RevenueReportRequest.class)))
                .thenReturn(new byte[0]);

        mockMvc.perform(get("/api/support/reports/export")
                .param("from", "2026-01-01")
                .param("to", "2026-01-31"))
                .andExpect(status().isOk());

        verify(reportExportService).exportReport(any(RevenueReportRequest.class));
    }
}
