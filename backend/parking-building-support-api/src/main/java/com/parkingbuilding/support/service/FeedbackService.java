package com.parkingbuilding.support.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.request.FeedbackSubmitRequest;
import com.parkingbuilding.support.dto.response.FeedbackResponse;
import com.parkingbuilding.support.enums.FeedbackStatus;
import com.parkingbuilding.support.sharedreadmodel.entity.FeedbackEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.FeedbackRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackSubmitRequest request, Long userId) {
        FeedbackEntity feedback = new FeedbackEntity();
        feedback.setUserId(userId);
        feedback.setParkingSessionId(request.getParkingSessionId());
        feedback.setReservationId(request.getReservationId());
        feedback.setFullName(request.getFullName());
        feedback.setEmail(request.getEmail());
        feedback.setPhone(request.getPhone());
        feedback.setSubject(request.getSubject());
        feedback.setContent(request.getContent());
        feedback.setStatus(FeedbackStatus.PENDING);

        System.out.println("Saving feedback...");
        FeedbackEntity saved = feedbackRepository.save(feedback);
        System.out.println("Saved feedback with id " + saved.getId());

        return new FeedbackResponse(
                saved.getId(),
                saved.getStatus(),
                "Feedback submitted successfully",
                saved.getCreatedAt());
    }
}
