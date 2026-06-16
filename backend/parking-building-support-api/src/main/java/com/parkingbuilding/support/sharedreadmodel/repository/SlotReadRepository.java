package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.parkingbuilding.support.sharedreadmodel.entity.SlotReadEntity;

public interface SlotReadRepository extends JpaRepository<SlotReadEntity, Long> {

    @Query("SELECT COUNT(s) FROM SlotReadEntity s WHERE s.status = 'AVAILABLE'")
    long countByStatus(String status);
    List<SlotReadEntity> findByStatus(String status);
}