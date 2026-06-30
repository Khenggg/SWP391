package com.parkingbuilding.support.dto.response;

import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDetailResponse {

    private Long id;

    private String actor;

    private Long actorUserId;

    private String sourceService;

    private String action;

    private String target;
    
    private String targetType;

    private String targetId;

    private String oldValue;

    private String newValue;

    private String reason;

    private String details;

    private OffsetDateTime createdAt;
}
