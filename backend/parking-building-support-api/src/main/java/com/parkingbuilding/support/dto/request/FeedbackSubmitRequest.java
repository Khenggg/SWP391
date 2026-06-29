package com.parkingbuilding.support.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackSubmitRequest {
    private Long parkingSessionId;

    private Long reservationId;

    @NotBlank
    private String fullName;

    @Email
    private String email;

    private String phone;

    @NotBlank
    private String subject;

    @NotBlank
    private String content;
}
