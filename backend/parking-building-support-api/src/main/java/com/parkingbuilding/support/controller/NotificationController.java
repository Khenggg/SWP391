package com.parkingbuilding.support.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.response.NotificationResponse;
import com.parkingbuilding.support.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ApiResponse<List<NotificationResponse>> getNotifications(
            @PathVariable Long userId) {

        return ApiResponse.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/{userId}/unread")
    public ApiResponse<List<NotificationResponse>> getUnread(
            @PathVariable Long userId) {

        return ApiResponse.ok(notificationService.getUnread(userId));
    }

    @GetMapping("/{userId}/count")
    public ApiResponse<Long> getUnreadCount(@PathVariable Long userId) {
        return ApiResponse.ok(notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ApiResponse.ok("Notification marked as read");
    }
}
