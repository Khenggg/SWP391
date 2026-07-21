package com.parkingbuilding.support.dto.request;

import com.parkingbuilding.support.enums.NotificationPriority;
import com.parkingbuilding.support.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationRequest {
    private Long userId;
    private String title;
    private String content;
    private NotificationType type;
    private NotificationPriority priority;
    private Long monthlyPassId;
    private Long reservationId;
    private Long paymentId;
    private Long parkingSessionId;
}
