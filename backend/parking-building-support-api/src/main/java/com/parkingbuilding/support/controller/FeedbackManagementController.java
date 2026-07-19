package com.parkingbuilding.support.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.request.FeedbackUpdateRequest;
import com.parkingbuilding.support.dto.response.FeedbackDetailResponse;
import com.parkingbuilding.support.dto.response.FeedbackListResponse;
import com.parkingbuilding.support.enums.FeedbackStatus;
import com.parkingbuilding.support.service.FeedbackManagementService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/feedbacks")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
public class FeedbackManagementController {
    private final FeedbackManagementService feedbackManagementService;

    @GetMapping
    public ApiResponse<List<FeedbackListResponse>> getAll(
            @RequestParam(required = false) FeedbackStatus status) {

        if (status == null) {
            return ApiResponse.ok(
                    feedbackManagementService.getAllFeedbacks());
        }

        return ApiResponse.ok(
                feedbackManagementService.getFeedbackByStatus(status));
    }

    @GetMapping("/{id}")
    public ApiResponse<FeedbackDetailResponse> getDetail(
            @PathVariable Long id) {

        return ApiResponse.ok(
                feedbackManagementService.getFeedback(id));
    }

    // @PutMapping("/{id}")
    // public ApiResponse<FeedbackDetailResponse> updateFeedback(
    // @PathVariable Long id,
    // @Valid @RequestBody FeedbackUpdateRequest request,
    // Authentication authentication) {

    // Long managerId = null;

    // if (authentication != null &&
    // authentication.getPrincipal() instanceof Jwt jwt) {

    // String userId = jwt.getClaimAsString("user_id");

    // if (userId != null) {
    // managerId = Long.parseLong(userId);
    // }
    // }

    // return ApiResponse.ok(
    // feedbackManagementService.updateFeedback(
    // id,
    // request,
    // managerId));
    // }
}
