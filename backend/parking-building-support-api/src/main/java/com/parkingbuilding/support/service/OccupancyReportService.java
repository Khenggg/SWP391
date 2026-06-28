package com.parkingbuilding.support.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.response.OccupancyReportResponse;
import com.parkingbuilding.support.sharedreadmodel.entity.AreaReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AreaReadRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OccupancyReportService {

        private final AreaReadRepository areaRepository;

        public OccupancyReportResponse getReport() {

                List<AreaReadEntity> areas = areaRepository.findAll();

                long totalCapacity = areas.stream()
                                .mapToLong(AreaReadEntity::getTotalCapacity)
                                .sum();

                long occupied = areas.stream()
                                .mapToLong(AreaReadEntity::getCurrentRealOccupancy)
                                .sum();

                long reserved = areas.stream()
                                .mapToLong(AreaReadEntity::getCurrentBookedSlots)
                                .sum();

                long available = totalCapacity - occupied - reserved;

                double rate = totalCapacity == 0
                                ? 0
                                : occupied * 100.0 / totalCapacity;

                return OccupancyReportResponse.builder()
                                .totalCapacity(totalCapacity)
                                .occupied(occupied)
                                .reserved(reserved)
                                .available(available)
                                .occupancyRate(rate)
                                .build();
        }
}
