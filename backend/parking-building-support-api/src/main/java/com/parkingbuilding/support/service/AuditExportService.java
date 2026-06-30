package com.parkingbuilding.support.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.parkingbuilding.support.sharedreadmodel.entity.AuditLogReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AuditLogReadRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditExportService {
    private final AuditLogReadRepository auditLogReadRepository;

    public byte[] exportAuditLogs() throws IOException {

        List<AuditLogReadEntity> audits = auditLogReadRepository.findAllByOrderByCreatedAtDesc();

        Workbook workbook = new XSSFWorkbook();

        Sheet sheet = workbook.createSheet("Audit Logs");

        int rowIndex = 0;

        Row header = sheet.createRow(rowIndex++);

        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("Actor User ID");
        header.createCell(2).setCellValue("Source Service");
        header.createCell(3).setCellValue("Action");
        header.createCell(4).setCellValue("Target Type");
        header.createCell(5).setCellValue("Target ID");
        header.createCell(6).setCellValue("Old Value");
        header.createCell(7).setCellValue("New Value");
        header.createCell(8).setCellValue("Reason");
        header.createCell(9).setCellValue("Created At");

        for (AuditLogReadEntity audit : audits) {

            Row row = sheet.createRow(rowIndex++);

            row.createCell(0).setCellValue(audit.getId());

            row.createCell(1).setCellValue(
                    audit.getActorUserId() == null
                            ? ""
                            : String.valueOf(audit.getActorUserId()));

            row.createCell(2).setCellValue(audit.getSourceService());

            row.createCell(3).setCellValue(audit.getAction());

            row.createCell(4).setCellValue(audit.getTargetType());

            row.createCell(5).setCellValue(audit.getTargetId());

            row.createCell(6).setCellValue(
                    audit.getOldValue() == null ? "" : audit.getOldValue());

            row.createCell(7).setCellValue(
                    audit.getNewValue() == null ? "" : audit.getNewValue());

            row.createCell(8).setCellValue(
                    audit.getReason() == null ? "" : audit.getReason());

            row.createCell(9).setCellValue(
                    audit.getCreatedAt() == null ? "" : audit.getCreatedAt().toString());
        }

        for (int i = 0; i <= 9; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        workbook.write(outputStream);

        workbook.close();

        return outputStream.toByteArray();
    }
}
