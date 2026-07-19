package com.parkingbuilding.support.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.response.AvailableSlotResponse;
import com.parkingbuilding.support.sharedreadmodel.entity.AreaReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.FloorReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.SlotReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.AreaReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.FloorReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.SlotReadRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AvailableSlotService {

    private final SlotReadRepository slotReadRepository;
    private final AreaReadRepository areaReadRepository;
    private final FloorReadRepository floorReadRepository;

    public List<AvailableSlotResponse> getAvailableSlots(
            Long vehicleTypeId,
            Long areaId,
            Long floorId) {

        List<SlotReadEntity> slots =
                slotReadRepository.findByStatus("AVAILABLE");

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

        slots = slots.stream()
                .filter(slot ->
                        activeAreaIds.contains(
                                slot.getAreaId()))
                .toList();

        if (vehicleTypeId != null) {

            slots = slots.stream()
                    .filter(slot ->
                            slot.getAllowedVehicleTypeId()
                                    .equals(vehicleTypeId))
                    .toList();
        }

        if (areaId != null) {

            if (!activeAreaIds.contains(areaId)) {
                return List.of();
            }

            slots = slots.stream()
                    .filter(slot ->
                            slot.getAreaId().equals(areaId))
                    .toList();
        }

        if (floorId != null) {

            if (!activeFloorIds.contains(floorId)) {
                return List.of();
            }

            List<Long> areaIds =
                    areaReadRepository.findByFloorId(floorId)
                            .stream()
                            .filter(area ->
                                    "ACTIVE".equalsIgnoreCase(
                                            area.getStatus()))
                            .map(AreaReadEntity::getId)
                            .toList();

            slots = slots.stream()
                    .filter(slot ->
                            areaIds.contains(
                                    slot.getAreaId()))
                    .toList();
        }

        return slots.stream()
                .map(slot ->
                        new AvailableSlotResponse(
                                slot.getId(),
                                slot.getSlotCode(),
                                slot.getAreaId(),
                                slot.getAllowedVehicleTypeId()))
                .toList();
    }

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