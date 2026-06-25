package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.parkingbuilding.support.sharedreadmodel.entity.ParkingSession;

public interface ParkingSessionReadRepository extends JpaRepository<ParkingSession, Long> {

    Optional<ParkingSession> findByCardIdAndStatus(Long cardId, String status);
}
