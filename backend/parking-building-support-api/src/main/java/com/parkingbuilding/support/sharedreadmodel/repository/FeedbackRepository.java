package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.enums.FeedbackStatus;
import com.parkingbuilding.support.sharedreadmodel.entity.FeedbackEntity;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntity, Long> {
    List<FeedbackEntity> findAllByStatus(FeedbackStatus status);
}
