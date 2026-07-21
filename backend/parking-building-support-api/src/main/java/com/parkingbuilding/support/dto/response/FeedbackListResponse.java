package com.parkingbuilding.support.dto.response;

import java.time.OffsetDateTime;

import com.parkingbuilding.support.enums.FeedbackStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor

public class FeedbackListResponse {
    private Long id;

    private String fullName;

    private String email;

    private String subject;

    private FeedbackStatus status;

    private OffsetDateTime createdAt;
}
