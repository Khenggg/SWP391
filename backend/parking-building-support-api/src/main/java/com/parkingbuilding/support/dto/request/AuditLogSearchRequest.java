package com.parkingbuilding.support.dto.request;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuditLogSearchRequest {

    private String actor;
    private String target;

    private Long actorUserId;
    private String sourceService;
    private String action;
    private String targetType;
    private String targetId;

    private LocalDate fromDate;
    private LocalDate toDate;

    private int page = 0;
    private int size = 20;
    private String sort = "createdAt,desc";
}
