package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.ParkingSessionImage;

@Repository
public interface ParkingSessionImageReadRepository extends JpaRepository<ParkingSessionImage, Long> {

    List<ParkingSessionImage> findBySessionId(Long sessionId);
}
