package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.AuditLogEntity;

@Repository
public interface AuditLogReadRepository
        extends ReadOnlyRepository<AuditLogEntity, Long> {

    List<AuditLogEntity> findByActorUserId(Long actorUserId);

    List<AuditLogEntity> findBySourceService(String sourceService);

    List<AuditLogEntity> findByTargetType(String targetType);

}