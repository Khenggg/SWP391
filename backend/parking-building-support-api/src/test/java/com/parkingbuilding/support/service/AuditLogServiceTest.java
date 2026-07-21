package com.parkingbuilding.support.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.parkingbuilding.support.sharedreadmodel.entity.AuditLogReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AuditLogReadRepository;

@ExtendWith(MockitoExtension.class)

public class AuditLogServiceTest {
    @Mock
    private AuditLogReadRepository repository;

    @InjectMocks
    private AuditLogService auditLogService;

    @Test
    void getDetail_shouldReturnData() {

        AuditLogReadEntity log = new AuditLogReadEntity();
        log.setId(1L);
        log.setAction("UPDATE");
        log.setTargetType("CARD");
        log.setTargetId("C001");
        log.setCreatedAt(OffsetDateTime.now());

        when(repository.findById(1L)).thenReturn(Optional.of(log));

        var result = auditLogService.getDetail(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("UPDATE", result.getAction());
    }

    @Test
    void getDetail_shouldThrowException() {

        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            auditLogService.getDetail(99L);
        });
    }
}
