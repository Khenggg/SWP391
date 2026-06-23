package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.SlotReadEntity;

@Repository
public interface SlotReadRepository extends ReadOnlyRepository<SlotReadEntity, Long> {

    long countByStatus(String status);
    List<SlotReadEntity> findByStatus(String status);
}