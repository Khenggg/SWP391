package com.parkingbuilding.support.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.request.CreateNotificationRequest;
import com.parkingbuilding.support.dto.response.NotificationResponse;
import com.parkingbuilding.support.enums.NotificationPriority;
import com.parkingbuilding.support.enums.NotificationType;
import com.parkingbuilding.support.sharedreadmodel.entity.NotificationEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<NotificationResponse> getUnread(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public void markAsRead(Long id) {
        System.out.println("=== NotificationService.markAsRead id=" + id + " ===");
        NotificationEntity entity = notificationRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Notification not found: " + id));
        entity.setIsRead(true);
        entity.setReadAt(java.time.OffsetDateTime.now());
        notificationRepository.save(entity);
    }

    private NotificationResponse toResponse(NotificationEntity entity) {
        return NotificationResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .type(entity.getType())
                .priority(entity.getPriority())
                .isRead(entity.getIsRead())
                .readAt(entity.getReadAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        NotificationEntity entity = NotificationEntity.builder()
                .userId(request.getUserId())
                .monthlyPassId(request.getMonthlyPassId())
                .reservationId(request.getReservationId())
                .paymentId(request.getPaymentId())
                .parkingSessionId(request.getParkingSessionId())
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .priority(request.getPriority())
                .isRead(false)
                .build();

        NotificationEntity saved = notificationRepository.save(entity);

        return toResponse(saved);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

}
