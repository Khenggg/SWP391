package com.parkingbuilding.support.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.dto.response.NotificationResponse;
import com.parkingbuilding.support.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public List<NotificationResponse> getNotifications(
            @PathVariable Long userId) {

        return notificationService.getUserNotifications(userId);
    }

    @GetMapping("/{userId}/unread")
    public List<NotificationResponse> getUnread(
            @PathVariable Long userId) {

        return notificationService.getUnread(userId);
    }

    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        System.out.println("=== NotificationController.markAsRead id=" + id + " ===");
        notificationService.markAsRead(id);
    }
}
