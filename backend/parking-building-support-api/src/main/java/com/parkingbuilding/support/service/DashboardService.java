package com.parkingbuilding.support.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.sharedreadmodel.entity.AreaReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.FloorReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AreaReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.FloorReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.SlotReadRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardService {

    private final SlotReadRepository slotReadRepository;
    private final AreaReadRepository areaReadRepository;
    private final FloorReadRepository floorReadRepository;

    public Map<String, Long> getStats() {

        List<Long> activeFloorIds =
                floorReadRepository.findByStatus("ACTIVE")
                        .stream()
                        .map(FloorReadEntity::getId)
                        .toList();

        List<Long> activeAreaIds =
                areaReadRepository.findByStatus("ACTIVE")
                        .stream()
                        .filter(area ->
                                activeFloorIds.contains(
                                        area.getFloorId()))
                        .map(AreaReadEntity::getId)
                        .toList();

        long available =
                slotReadRepository.findByStatus("AVAILABLE")
                        .stream()
                        .filter(slot ->
                                activeAreaIds.contains(
                                        slot.getAreaId()))
                        .count();

        long occupied =
                slotReadRepository.findByStatus("OCCUPIED")
                        .stream()
                        .filter(slot ->
                                activeAreaIds.contains(
                                        slot.getAreaId()))
                        .count();

        long reserved =
                slotReadRepository.findByStatus("RESERVED")
                        .stream()
                        .filter(slot ->
                                activeAreaIds.contains(
                                        slot.getAreaId()))
                        .count();

        return Map.of(
                "totalSlotsAvailable", available,
                "totalSlotsOccupied", occupied,
                "totalSlotsReserved", reserved
        );
    }
}