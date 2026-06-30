package com.parkingbuilding.support.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.parkingbuilding.support.dto.request.AuditLogSearchRequest;
import com.parkingbuilding.support.dto.response.AuditLogDetailResponse;
import com.parkingbuilding.support.dto.response.AuditLogResponse;
import com.parkingbuilding.support.service.AuditLogService;

@WebMvcTest(AuditLogController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuditLogControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @SuppressWarnings("removal")
    @MockBean
    private AuditLogService auditLogService;

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void search_shouldReturnPagedAuditLogs() throws Exception {

        AuditLogResponse response = AuditLogResponse.builder()
                .id(1L)
                .actor("1")
                .actorUserId(1L)
                .sourceService("Support")
                .action("CREATE")
                .targetType("CARD")
                .targetId("CARD001")
                .reason("Create card")
                .createdAt(OffsetDateTime.now())
                .build();

        Page<AuditLogResponse> page = new PageImpl<>(List.of(response));

        when(auditLogService.search(any(AuditLogSearchRequest.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/audit-logs")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("OK"))
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.items[0].id").value(1))
                .andExpect(jsonPath("$.data.items[0].action").value("CREATE"));

        verify(auditLogService).search(any(AuditLogSearchRequest.class));
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void search_withRequestParams_shouldReturn200() throws Exception {

        when(auditLogService.search(any(AuditLogSearchRequest.class)))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/api/audit-logs")
                .param("actor", "1")
                .param("action", "CREATE")
                .param("targetType", "CARD")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(auditLogService).search(any(AuditLogSearchRequest.class));
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void getDetail_shouldReturnAuditLog() throws Exception {

        AuditLogDetailResponse detail = AuditLogDetailResponse.builder()
                .id(1L)
                .actor("1")
                .actorUserId(1L)
                .sourceService("Support")
                .action("UPDATE")
                .targetType("CARD")
                .targetId("CARD001")
                .oldValue("OLD")
                .newValue("NEW")
                .reason("Update")
                .details("Update card")
                .createdAt(OffsetDateTime.now())
                .build();

        when(auditLogService.getDetail(1L))
                .thenReturn(detail);

        mockMvc.perform(get("/api/audit-logs/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.action").value("UPDATE"))
                .andExpect(jsonPath("$.data.targetType").value("CARD"));

        verify(auditLogService).getDetail(1L);
    }
}
