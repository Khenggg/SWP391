package com.parkingbuilding.support.sharedreadmodel.repository;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.parkingbuilding.support.sharedreadmodel.entity.ParkingSession;

public interface ParkingSessionReadRepository extends JpaRepository<ParkingSession, Long> {

    Optional<ParkingSession> findByCardIdAndStatus(Long cardId, String status);

    long countByStatus(String status);

    long countByEntryTimeBetween(
            OffsetDateTime from,
            OffsetDateTime to);

    long countByExitTimeBetween(
            OffsetDateTime from,
            OffsetDateTime to);

    long countByEntryTimeBetween(Instant from, Instant to);

    long countByExitTimeBetween(Instant from, Instant to);
}
