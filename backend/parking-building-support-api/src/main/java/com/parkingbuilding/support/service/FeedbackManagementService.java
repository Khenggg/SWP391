package com.parkingbuilding.support.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.request.FeedbackUpdateRequest;
import com.parkingbuilding.support.dto.response.FeedbackDetailResponse;
import com.parkingbuilding.support.dto.response.FeedbackListResponse;
import com.parkingbuilding.support.enums.FeedbackStatus;
import com.parkingbuilding.support.sharedreadmodel.entity.FeedbackEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.FeedbackRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FeedbackManagementService {

    private final FeedbackRepository feedbackRepository;

    public List<FeedbackListResponse> getAllFeedbacks() {
        return feedbackRepository.findAll()
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    public List<FeedbackListResponse> getFeedbackByStatus(FeedbackStatus status) {
        return feedbackRepository.findAllByStatus(status)
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    private FeedbackListResponse toListResponse(FeedbackEntity e) {
        return new FeedbackListResponse(
                e.getId(),
                e.getFullName(),
                e.getEmail(),
                e.getSubject(),
                e.getStatus(),
                e.getCreatedAt());
    }

    public FeedbackDetailResponse getFeedback(Long id) {
        System.out.println("=== FeedbackManagementService.getFeedback id=" + id + " ===");
        FeedbackEntity entity = feedbackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found: " + id));
        return toDetailResponse(entity);
    }

    @Transactional
    public FeedbackDetailResponse updateFeedback(Long id, FeedbackUpdateRequest request, Long managerId) {
        System.out
                .println("=== FeedbackManagementService.updateFeedback id=" + id + " managerId=" + managerId + " ===");
        FeedbackEntity entity = feedbackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found: " + id));

        entity.setStatus(request.getStatus());
        if (request.getResponse() != null) {
            entity.setResponse(request.getResponse());
        }
        entity.setRespondedBy(managerId);
        entity.setRespondedAt(OffsetDateTime.now());

        FeedbackEntity saved = feedbackRepository.save(entity);
        return toDetailResponse(saved);
    }

    private FeedbackDetailResponse toDetailResponse(FeedbackEntity e) {
        return new FeedbackDetailResponse(
                e.getId(),
                e.getUserId(),
                e.getParkingSessionId(),
                e.getReservationId(),
                e.getFullName(),
                e.getEmail(),
                e.getPhone(),
                e.getSubject(),
                e.getContent(),
                e.getStatus(),
                e.getResponse(),
                e.getRespondedBy(),
                e.getRespondedAt(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }
}
