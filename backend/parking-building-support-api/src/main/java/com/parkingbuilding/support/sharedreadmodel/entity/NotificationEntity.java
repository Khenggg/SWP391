package com.parkingbuilding.support.sharedreadmodel.entity;

import java.time.OffsetDateTime;

import com.parkingbuilding.support.enums.NotificationPriority;
import com.parkingbuilding.support.enums.NotificationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "monthly_pass_id")
    private Long monthlyPassId;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "parking_session_id")
    private Long parkingSessionId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority;

    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "read_at")
    private OffsetDateTime readAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public NotificationEntity() {
    }

    public NotificationEntity(Long id, Long userId, Long monthlyPassId, Long reservationId,
            Long paymentId, Long parkingSessionId, String title, String content,
            NotificationType type, NotificationPriority priority,
            Boolean isRead, OffsetDateTime readAt, OffsetDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.monthlyPassId = monthlyPassId;
        this.reservationId = reservationId;
        this.paymentId = paymentId;
        this.parkingSessionId = parkingSessionId;
        this.title = title;
        this.content = content;
        this.type = type;
        this.priority = priority;
        this.isRead = isRead;
        this.readAt = readAt;
        this.createdAt = createdAt;
    }

    public static NotificationEntityBuilder builder() {
        return new NotificationEntityBuilder();
    }

    public static class NotificationEntityBuilder {
        private Long id;
        private Long userId;
        private Long monthlyPassId;
        private Long reservationId;
        private Long paymentId;
        private Long parkingSessionId;
        private String title;
        private String content;
        private NotificationType type;
        private NotificationPriority priority;
        private Boolean isRead;
        private OffsetDateTime readAt;
        private OffsetDateTime createdAt;

        public NotificationEntityBuilder id(Long id) { this.id = id; return this; }
        public NotificationEntityBuilder userId(Long userId) { this.userId = userId; return this; }
        public NotificationEntityBuilder monthlyPassId(Long monthlyPassId) { this.monthlyPassId = monthlyPassId; return this; }
        public NotificationEntityBuilder reservationId(Long reservationId) { this.reservationId = reservationId; return this; }
        public NotificationEntityBuilder paymentId(Long paymentId) { this.paymentId = paymentId; return this; }
        public NotificationEntityBuilder parkingSessionId(Long parkingSessionId) { this.parkingSessionId = parkingSessionId; return this; }
        public NotificationEntityBuilder title(String title) { this.title = title; return this; }
        public NotificationEntityBuilder content(String content) { this.content = content; return this; }
        public NotificationEntityBuilder type(NotificationType type) { this.type = type; return this; }
        public NotificationEntityBuilder priority(NotificationPriority priority) { this.priority = priority; return this; }
        public NotificationEntityBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
        public NotificationEntityBuilder readAt(OffsetDateTime readAt) { this.readAt = readAt; return this; }
        public NotificationEntityBuilder createdAt(OffsetDateTime createdAt) { this.createdAt = createdAt; return this; }

        public NotificationEntity build() {
            return new NotificationEntity(id, userId, monthlyPassId, reservationId,
                    paymentId, parkingSessionId, title, content, type, priority, isRead, readAt, createdAt);
        }
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
        if (isRead == null)
            isRead = false;
        if (priority == null)
            priority = NotificationPriority.NORMAL;
    }
}
