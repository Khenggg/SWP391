package com.parkingbuilding.support.sharedreadmodel.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.AuditLogReadEntity;

@Repository
public interface AuditLogReadRepository extends JpaRepository<AuditLogReadEntity, Long> {
}
