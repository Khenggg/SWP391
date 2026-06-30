package com.parkingbuilding.support.dto.response;

import java.time.OffsetDateTime;

import com.parkingbuilding.support.enums.NotificationPriority;
import com.parkingbuilding.support.enums.NotificationType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponse {
    private Long id;

    private String title;

    private String content;

    private NotificationType type;

    private NotificationPriority priority;

    private Boolean isRead;

    private OffsetDateTime readAt;

    private OffsetDateTime createdAt;
}
