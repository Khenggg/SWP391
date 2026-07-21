package com.parkingbuilding.support.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.parkingbuilding.support.sharedreadmodel.entity.AuditLogReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AuditLogReadRepository;

@ExtendWith(MockitoExtension.class)
public class AuditExportServiceTest {
    @Mock
    private AuditLogReadRepository auditLogReadRepository;

    @InjectMocks
    private AuditExportService auditExportService;

    @Test
    void exportAuditLogs_shouldReturnExcelBytes() throws IOException {

        AuditLogReadEntity log = new AuditLogReadEntity();
        log.setId(1L);
        log.setActorUserId(10L);
        log.setSourceService("Support");
        log.setAction("CREATE");
        log.setTargetType("CARD");
        log.setTargetId("C001");

        when(auditLogReadRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of(log));

        byte[] result = auditExportService.exportAuditLogs();

        assertNotNull(result);
        assertTrue(result.length > 0);

        verify(auditLogReadRepository, times(1))
                .findAllByOrderByCreatedAtDesc();
    }

    @Test
    void exportAuditLogs_shouldReturnEmptyExcelWhenNoData() throws IOException {

        when(auditLogReadRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of());

        byte[] result = auditExportService.exportAuditLogs();

        assertNotNull(result);
        assertTrue(result.length > 0);
    }
}
