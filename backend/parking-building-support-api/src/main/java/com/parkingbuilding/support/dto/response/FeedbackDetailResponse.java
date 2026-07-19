package com.parkingbuilding.support.dto.response;

import java.time.OffsetDateTime;

import com.parkingbuilding.support.enums.FeedbackStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FeedbackDetailResponse {
    private Long id;
    private Long userId;
    private Long parkingSessionId;
    private Long reservationId;
    private String fullName;
    private String email;
    private String phone;
    private String subject;
    private String content;
    private FeedbackStatus status;
    private String response;
    private Long respondedBy;
    private OffsetDateTime respondedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
