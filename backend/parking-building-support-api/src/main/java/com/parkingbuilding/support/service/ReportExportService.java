package com.parkingbuilding.support.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.parkingbuilding.support.dto.request.RevenueReportRequest;
import com.parkingbuilding.support.dto.response.DashboardResponse;
import com.parkingbuilding.support.dto.response.OccupancyReportResponse;
import com.parkingbuilding.support.dto.response.RevenueReportResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportExportService {
    private final DashboardService dashboardService;
    private final RevenueReportService revenueReportService;
    private final OccupancyReportService occupancyReportService;

    public byte[] exportReport(
            RevenueReportRequest request) throws IOException {

        DashboardResponse dashboard = dashboardService.getDashboard();

        RevenueReportResponse revenue = revenueReportService.getReport(request);

        OccupancyReportResponse occupancy = occupancyReportService.getReport();

        Workbook workbook = new XSSFWorkbook();

        createDashboardSheet(workbook, dashboard);

        createRevenueSheet(workbook, revenue);

        createOccupancySheet(workbook, occupancy);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        workbook.write(outputStream);

        workbook.close();

        return outputStream.toByteArray();
    }

    private void createDashboardSheet(
            Workbook workbook,
            DashboardResponse dashboard) {

        Sheet sheet = workbook.createSheet("Dashboard");

        int rowIndex = 0;

        Row row;

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Metric");
        row.createCell(1).setCellValue("Value");

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Total Slots");
        row.createCell(1).setCellValue(dashboard.getSlot().getTotal());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Available Slots");
        row.createCell(1).setCellValue(dashboard.getSlot().getAvailable());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Occupied Slots");
        row.createCell(1).setCellValue(dashboard.getSlot().getOccupied());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Reserved Slots");
        row.createCell(1).setCellValue(dashboard.getSlot().getReserved());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Locked Slots");
        row.createCell(1).setCellValue(dashboard.getSlot().getLocked());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Maintenance Slots");
        row.createCell(1).setCellValue(dashboard.getSlot().getMaintenance());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Entries Today");
        row.createCell(1).setCellValue(dashboard.getTraffic().getEntriesToday());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Exits Today");
        row.createCell(1).setCellValue(dashboard.getTraffic().getExitsToday());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Active Sessions");
        row.createCell(1).setCellValue(dashboard.getTraffic().getActiveSessions());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Today's Revenue");
        row.createCell(1).setCellValue(
                dashboard.getRevenue().getTodayRevenue().doubleValue());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Available Cards");
        row.createCell(1).setCellValue(dashboard.getCard().getAvailable());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Cards In Use");
        row.createCell(1).setCellValue(dashboard.getCard().getInUse());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Lost Cards");
        row.createCell(1).setCellValue(dashboard.getCard().getLost());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Damaged Cards");
        row.createCell(1).setCellValue(dashboard.getCard().getDamaged());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Inactive Cards");
        row.createCell(1).setCellValue(dashboard.getCard().getInactive());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Pending Lost Cards");
        row.createCell(1).setCellValue(dashboard.getPending().getLostCardPending());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Pending Plate Mismatch");
        row.createCell(1).setCellValue(dashboard.getPending().getPlateMismatchPending());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Total Pending");
        row.createCell(1).setCellValue(dashboard.getPending().getTotalPending());

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createRevenueSheet(
            Workbook workbook,
            RevenueReportResponse revenue) {

        Sheet sheet = workbook.createSheet("Revenue");

        int rowIndex = 0;

        Row row;

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Metric");
        row.createCell(1).setCellValue("Value");

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("From");
        row.createCell(1).setCellValue(revenue.getFrom().toString());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("To");
        row.createCell(1).setCellValue(revenue.getTo().toString());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Total Revenue");
        row.createCell(1).setCellValue(revenue.getTotalRevenue().doubleValue());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Total Payments");
        row.createCell(1).setCellValue(revenue.getTotalPayments());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Paid Payments");
        row.createCell(1).setCellValue(revenue.getPaidPayments());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Pending Payments");
        row.createCell(1).setCellValue(revenue.getPendingPayments());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Cancelled Payments");
        row.createCell(1).setCellValue(revenue.getCancelledPayments());

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createOccupancySheet(
            Workbook workbook,
            OccupancyReportResponse occupancy) {

        Sheet sheet = workbook.createSheet("Occupancy");

        int rowIndex = 0;

        Row row;

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Metric");
        row.createCell(1).setCellValue("Value");

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Total Capacity");
        row.createCell(1).setCellValue(occupancy.getTotalCapacity());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Occupied");
        row.createCell(1).setCellValue(occupancy.getOccupied());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Reserved");
        row.createCell(1).setCellValue(occupancy.getReserved());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Available");
        row.createCell(1).setCellValue(occupancy.getAvailable());

        row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue("Occupancy Rate (%)");
        row.createCell(1).setCellValue(occupancy.getOccupancyRate());

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }
}
