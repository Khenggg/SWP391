package com.parkingbuilding.support.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.parkingbuilding.support.dto.request.RevenueReportRequest;
import com.parkingbuilding.support.dto.response.CardSummaryResponse;
import com.parkingbuilding.support.dto.response.DashboardResponse;
import com.parkingbuilding.support.dto.response.OccupancyReportResponse;
import com.parkingbuilding.support.dto.response.PendingSummaryResponse;
import com.parkingbuilding.support.dto.response.RevenueReportResponse;
import com.parkingbuilding.support.dto.response.RevenueSummaryResponse;
import com.parkingbuilding.support.dto.response.SlotSummaryResponse;
import com.parkingbuilding.support.dto.response.TrafficSummaryResponse;

@ExtendWith(MockitoExtension.class)
public class ReportExportServiceTest {
    @Mock
    private DashboardService dashboardService;

    @Mock
    private RevenueReportService revenueReportService;

    @Mock
    private OccupancyReportService occupancyReportService;

    @InjectMocks
    private ReportExportService reportExportService;

    @Test
    void exportReport_shouldGenerateExcel() throws IOException {

        DashboardResponse dashboard = DashboardResponse.builder()
                .slot(SlotSummaryResponse.builder().total(100).available(80).build())
                .traffic(new TrafficSummaryResponse())
                .revenue(RevenueSummaryResponse.builder()
                        .todayRevenue(BigDecimal.valueOf(5000))
                        .build())
                .card(new CardSummaryResponse())
                .pending(new PendingSummaryResponse())
                .build();

        RevenueReportResponse response = RevenueReportResponse.builder()
                .from(OffsetDateTime.now().minusDays(7))
                .to(OffsetDateTime.now())
                .totalRevenue(BigDecimal.valueOf(1000))
                .totalPayments(10)
                .paidPayments(8)
                .pendingPayments(1)
                .cancelledPayments(1)
                .build();

        OccupancyReportResponse occupancy = OccupancyReportResponse.builder()
                .totalCapacity(100)
                .occupied(60)
                .reserved(10)
                .available(30)
                .occupancyRate(60.0)
                .build();

        when(dashboardService.getDashboard()).thenReturn(dashboard);
        when(revenueReportService.getReport(any())).thenReturn(response);
        when(occupancyReportService.getReport()).thenReturn(occupancy);

        byte[] result = reportExportService.exportReport(new RevenueReportRequest());

        assertNotNull(result);
        assertTrue(result.length > 0);

        verify(dashboardService).getDashboard();
        verify(revenueReportService).getReport(any());
        verify(occupancyReportService).getReport();
    }
}
