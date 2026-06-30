package com.parkingbuilding.support.dto.request;

import com.parkingbuilding.support.enums.FeedbackStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackUpdateRequest {
    @NotNull
    private FeedbackStatus status;

    private String response;
}
