package com.parkingbuilding.support.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
public class DashboardService {

    private final SlotReadRepository slotReadRepository;
    private final AreaReadRepository areaReadRepository;
    private final FloorReadRepository floorReadRepository;

    public Map<String, Long> getStats() {

        // Lấy Floor ACTIVE
        List<FloorReadEntity> activeFloors
                = floorReadRepository.findByStatus("ACTIVE");

        List<Long> activeFloorIds = new ArrayList<>();

        for (FloorReadEntity floor : activeFloors) {
            activeFloorIds.add(floor.getId());
        }

        // Lấy Area ACTIVE thuộc Floor ACTIVE
        List<AreaReadEntity> activeAreas
                = areaReadRepository.findByStatus("ACTIVE");

        List<Long> activeAreaIds = new ArrayList<>();

        for (AreaReadEntity area : activeAreas) {

            if (activeFloorIds.contains(area.getFloorId())) {
                activeAreaIds.add(area.getId());
            }
        }

        // Đếm slot
        long available = countSlots("AVAILABLE", activeAreaIds);
        long occupied = countSlots("OCCUPIED", activeAreaIds);
        long reserved = countSlots("RESERVED", activeAreaIds);

        return Map.of(
                "totalSlotsAvailable", available,
                "totalSlotsOccupied", occupied,
                "totalSlotsReserved", reserved
        );
    }

    private long countSlots(
            String status,
            List<Long> activeAreaIds) {

        List<SlotReadEntity> slots
                = slotReadRepository.findByStatus(status);

        long count = 0;

        for (SlotReadEntity slot : slots) {

            if (activeAreaIds.contains(slot.getAreaId())) {
                count++;
            }
        }

        return count;
    }
}
