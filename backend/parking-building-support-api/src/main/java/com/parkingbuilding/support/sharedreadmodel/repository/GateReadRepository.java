package com.parkingbuilding.support.sharedreadmodel.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.GateReadEntity;

@Repository
public interface GateReadRepository
        extends JpaRepository<GateReadEntity, Long> {

    Optional<GateReadEntity> findByGateCode(String gateCode);

    List<GateReadEntity> findByFloorId(Long floorId);

    List<GateReadEntity> findByGateType(String gateType);

    List<GateReadEntity> findByStatus(String status);

}