package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.FloorReadEntity;

@Repository
public interface FloorReadRepository
        extends JpaRepository<FloorReadEntity, Long> {

    Optional<FloorReadEntity> findByFloorCode(String floorCode);

    List<FloorReadEntity> findByStatus(String status);

}