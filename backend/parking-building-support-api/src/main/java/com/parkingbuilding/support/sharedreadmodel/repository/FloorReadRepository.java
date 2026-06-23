package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.FloorReadEntity;

@Repository
public interface FloorReadRepository
        extends ReadOnlyRepository<FloorReadEntity, Long> {

    Optional<FloorReadEntity> findByFloorCode(String floorCode);

    List<FloorReadEntity> findByStatus(String status);

}