package com.parkingbuilding.support.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import com.parkingbuilding.support.dto.request.FeedbackSubmitRequest;
import com.parkingbuilding.support.dto.response.FeedbackResponse;
import com.parkingbuilding.support.service.FeedbackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support/feedbacks")
@RequiredArgsConstructor
@Validated
public class FeedbackController {
    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @Valid @RequestBody FeedbackSubmitRequest request,
            Authentication authentication) {

        try {
            System.out.println("===== Feedback Controller =====");

            Long userId = null;

            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                String userIdStr = jwt.getClaimAsString("user_id");
                if (userIdStr != null) {
                    userId = Long.parseLong(userIdStr);
                }
            }

            FeedbackResponse response = feedbackService.submitFeedback(request, userId);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
