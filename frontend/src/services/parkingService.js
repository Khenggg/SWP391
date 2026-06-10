import { MOCK_PARKING_INFO, MOCK_FLOORS, MOCK_AREAS, MOCK_SLOTS, MOCK_GATES, MOCK_VEHICLE_TYPES } from "../constants/mockData";

const INFO_KEY = "parking_info";
const FLOORS_KEY = "parking_floors";
const AREAS_KEY = "parking_areas";
const SLOTS_KEY = "parking_slots";
const GATES_KEY = "parking_gates";

const initializeData = (key, seedData) => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Lỗi phân tích cú pháp ${key}`, e);
    }
  }
  localStorage.setItem(key, JSON.stringify(seedData));
  return seedData;
};

export const parkingService = {
  getParkingInfo: () => {
    return initializeData(INFO_KEY, MOCK_PARKING_INFO);
  },

  getFloors: () => {
    return initializeData(FLOORS_KEY, MOCK_FLOORS);
  },

  getAreas: () => {
    return initializeData(AREAS_KEY, MOCK_AREAS);
  },

  getSlots: () => {
    return initializeData(SLOTS_KEY, MOCK_SLOTS);
  },

  getGates: () => {
    return initializeData(GATES_KEY, MOCK_GATES);
  },

  getVehicleTypes: () => {
    return MOCK_VEHICLE_TYPES;
  },

  saveFloors: (floors) => {
    localStorage.setItem(FLOORS_KEY, JSON.stringify(floors));
  },

  saveAreas: (areas) => {
    localStorage.setItem(AREAS_KEY, JSON.stringify(areas));
  },

  saveSlots: (slots) => {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  },

  saveGates: (gates) => {
    localStorage.setItem(GATES_KEY, JSON.stringify(gates));
  },

  incrementAreaOccupancy: (areaCode) => {
    const areas = parkingService.getAreas();
    const index = areas.findIndex(a => a.code === areaCode);
    if (index !== -1) {
      const area = areas[index];
      if (area.currentCount !== undefined && area.maxCapacity) {
        area.currentCount = Math.min(area.maxCapacity, area.currentCount + 1);
      }
      if (area.availableSlots !== undefined) {
        area.availableSlots = Math.max(0, area.availableSlots - 1);
      }
      localStorage.setItem(AREAS_KEY, JSON.stringify(areas));
      
      // Đồng thời cập nhật availableSlots tổng quan trong Parking Info
      const info = parkingService.getParkingInfo();
      info.availableSlots = Math.max(0, info.availableSlots - 1);
      localStorage.setItem(INFO_KEY, JSON.stringify(info));
    }
  },

  decrementAreaOccupancy: (areaCode) => {
    const areas = parkingService.getAreas();
    const index = areas.findIndex(a => a.code === areaCode);
    if (index !== -1) {
      const area = areas[index];
      if (area.currentCount !== undefined && area.currentCount > 0) {
        area.currentCount = area.currentCount - 1;
      }
      if (area.availableSlots !== undefined && area.totalSlots) {
        area.availableSlots = Math.min(area.totalSlots, area.availableSlots + 1);
      }
      localStorage.setItem(AREAS_KEY, JSON.stringify(areas));

      // Đồng thời cập nhật availableSlots tổng quan trong Parking Info
      const info = parkingService.getParkingInfo();
      info.availableSlots = Math.min(info.totalSlots || 40, info.availableSlots + 1);
      localStorage.setItem(INFO_KEY, JSON.stringify(info));
    }
  }
};

