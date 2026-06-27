package com.parkingbuilding.support.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.common.response.PagedResponse;
import com.parkingbuilding.support.dto.request.AuditLogSearchRequest;
import com.parkingbuilding.support.dto.response.AuditLogDetailResponse;
import com.parkingbuilding.support.dto.response.AuditLogResponse;
import com.parkingbuilding.support.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ApiResponse<PagedResponse<AuditLogResponse>> search(
            @ModelAttribute AuditLogSearchRequest request
    ) {
        Page<AuditLogResponse> page = auditLogService.search(request);

        return ApiResponse.ok(new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        ));
    }

    @GetMapping("/{id}")
    public ApiResponse<AuditLogDetailResponse> getDetail(@PathVariable Long id) {
        return ApiResponse.ok(auditLogService.getDetail(id));
    }
}

