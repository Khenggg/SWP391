package com.parkingbuilding.support.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.parkingbuilding.support.dto.request.AuditLogSearchRequest;
import com.parkingbuilding.support.dto.response.AuditLogDetailResponse;
import com.parkingbuilding.support.dto.response.AuditLogResponse;
import com.parkingbuilding.support.sharedreadmodel.entity.AuditLogReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AuditLogReadRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;
    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "id", "actorUserId", "sourceService", "action", "targetType", "targetId", "createdAt");

    private final AuditLogReadRepository repository;

    @PersistenceContext
    private EntityManager entityManager;

    public Page<AuditLogResponse> search(AuditLogSearchRequest request) {
        AuditLogSearchRequest safeRequest = request == null ? new AuditLogSearchRequest() : request;
        Pageable pageable = PageRequest.of(
                Math.max(safeRequest.getPage(), DEFAULT_PAGE),
                normalizeSize(safeRequest.getSize()));

        return searchAuditLogs(safeRequest, pageable).map(this::map);
    }

    public AuditLogDetailResponse getDetail(Long id) {
        AuditLogReadEntity log = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Audit log not found with id: " + id));

        return mapToDetailResponse(log);
    }

    private Page<AuditLogReadEntity> searchAuditLogs(AuditLogSearchRequest request, Pageable pageable) {
        Map<String, Object> params = new HashMap<>();
        String whereClause = buildWhereClause(request, params);
        String orderClause = buildOrderClause(request.getSort());

        TypedQuery<AuditLogReadEntity> query = entityManager.createQuery(
                "select log from AuditLogReadEntity log" + whereClause + orderClause,
                AuditLogReadEntity.class);
        TypedQuery<Long> countQuery = entityManager.createQuery(
                "select count(log) from AuditLogReadEntity log" + whereClause,
                Long.class);

        params.forEach((name, value) -> {
            query.setParameter(name, value);
            countQuery.setParameter(name, value);
        });

        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        return new PageImpl<>(query.getResultList(), pageable, countQuery.getSingleResult());
    }

    private String buildWhereClause(AuditLogSearchRequest request, Map<String, Object> params) {
        StringBuilder where = new StringBuilder(" where 1 = 1");

        Long actorUserId = resolveActorUserId(request);
        if (actorUserId != null) {
            where.append(" and log.actorUserId = :actorUserId");
            params.put("actorUserId", actorUserId);
        }
        if (StringUtils.hasText(request.getSourceService())) {
            where.append(" and lower(log.sourceService) like :sourceService");
            params.put("sourceService", likePattern(request.getSourceService()));
        }
        if (StringUtils.hasText(request.getAction())) {
            where.append(" and lower(log.action) like :action");
            params.put("action", likePattern(request.getAction()));
        }

        String targetType = resolveTargetType(request);
        if (StringUtils.hasText(targetType)) {
            where.append(" and lower(log.targetType) like :targetType");
            params.put("targetType", likePattern(targetType));
        }
        if (StringUtils.hasText(request.getTargetId())) {
            where.append(" and log.targetId = :targetId");
            params.put("targetId", request.getTargetId().trim());
        }
        if (request.getFromDate() != null) {
            where.append(" and log.createdAt >= :fromDate");
            params.put("fromDate", atStartOfDay(request.getFromDate()));
        }
        if (request.getToDate() != null) {
            where.append(" and log.createdAt <= :toDate");
            params.put("toDate", atEndOfDay(request.getToDate()));
        }

        return where.toString();
    }

    private Long resolveActorUserId(AuditLogSearchRequest request) {
        if (request.getActorUserId() != null) {
            return request.getActorUserId();
        }
        if (!StringUtils.hasText(request.getActor())) {
            return null;
        }
        try {
            return Long.valueOf(request.getActor().trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String resolveTargetType(AuditLogSearchRequest request) {
        if (StringUtils.hasText(request.getTargetType())) {
            return request.getTargetType().trim();
        }
        return StringUtils.hasText(request.getTarget()) ? request.getTarget().trim() : null;
    }

    private String buildOrderClause(String sort) {
        String field = "createdAt";
        String direction = "desc";

        if (StringUtils.hasText(sort)) {
            String[] parts = sort.split(",", 2);
            if (SORTABLE_FIELDS.contains(parts[0].trim())) {
                field = parts[0].trim();
            }
            if (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())) {
                direction = "asc";
            }
        }

        return " order by log." + field + " " + direction;
    }

    private String likePattern(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }

    private OffsetDateTime atStartOfDay(LocalDate date) {
        return date == null ? null : OffsetDateTime.of(date, LocalTime.MIN, ZoneOffset.UTC);
    }

    private OffsetDateTime atEndOfDay(LocalDate date) {
        return date == null ? null : OffsetDateTime.of(date, LocalTime.MAX, ZoneOffset.UTC);
    }

    private int normalizeSize(int size) {
        if (size <= 0) {
            return DEFAULT_SIZE;
        }
        return Math.min(size, MAX_SIZE);
    }

    private String toActor(AuditLogReadEntity log) {
        return log.getActorUserId() == null ? null : String.valueOf(log.getActorUserId());
    }

    private String resolveDetails(AuditLogReadEntity log) {
        if (StringUtils.hasText(log.getReason())) {
            return log.getReason();
        }
        if (StringUtils.hasText(log.getNewValue())) {
            return log.getNewValue();
        }
        return log.getOldValue();
    }

    private AuditLogResponse map(AuditLogReadEntity log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .actor(toActor(log))
                .actorUserId(log.getActorUserId())
                .sourceService(log.getSourceService())
                .action(log.getAction())
                .target(log.getTargetType())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .reason(log.getReason())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private AuditLogDetailResponse mapToDetailResponse(AuditLogReadEntity log) {
        return AuditLogDetailResponse.builder()
                .id(log.getId())
                .actor(toActor(log))
                .actorUserId(log.getActorUserId())
                .sourceService(log.getSourceService())
                .action(log.getAction())
                .target(log.getTargetType())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .reason(log.getReason())
                .details(resolveDetails(log))
                .createdAt(log.getCreatedAt())
                .build();
    }

}
