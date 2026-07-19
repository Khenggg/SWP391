package com.parkingbuilding.support.dto.response;

import java.time.OffsetDateTime;

import com.parkingbuilding.support.enums.FeedbackStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;

    private FeedbackStatus status;

    private String message;

    private OffsetDateTime createdAt;
}
