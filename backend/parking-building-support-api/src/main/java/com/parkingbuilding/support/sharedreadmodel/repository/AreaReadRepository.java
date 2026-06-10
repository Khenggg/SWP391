package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.AreaReadEntity;

@Repository
public interface AreaReadRepository
        extends JpaRepository<AreaReadEntity, Long> {

    Optional<AreaReadEntity> findByAreaCode(String areaCode);

    List<AreaReadEntity> findByFloorId(Long floorId);

    List<AreaReadEntity> findByStatus(String status);

}