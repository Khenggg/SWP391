package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.AreaReadEntity;

@Repository
public interface AreaReadRepository
        extends ReadOnlyRepository<AreaReadEntity, Long> {

    Optional<AreaReadEntity> findByAreaCode(String areaCode);

    List<AreaReadEntity> findByFloorId(Long floorId);

    List<AreaReadEntity> findByStatus(String status);

    List<AreaReadEntity> findByIdIn(Set<Long> ids);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(a.totalCapacity), 0) FROM AreaReadEntity a")
    Integer sumTotalCapacity();

}
