import coreAxiosClient from "../api/coreAxiosClient";
import publicAxiosClient from "../api/publicAxiosClient";

export const parkingService = {
  // Public APIs
  getParkingInfo: async () => {
    const res = await publicAxiosClient.get("/parking-info");
    return res.success ? res.data : null;
  },



  getAvailableSlots: async () => {
    const res = await publicAxiosClient.get("/available-slots");
    if (!res.success) return { areas: [], slots: [], floors: [], vehicleTypes: [] };

    /** Backend trả về: Array<{ id, slotCode, areaId, allowedVehicleTypeId }>
     *  Mock trả về thêm: areaCode, floorCode, vehicleTypeName (để tiện hiển thị)
     *  Frontend parse slotCode để tách floor/area nếu cần
     */
    const slots = Array.isArray(res.data) ? res.data : [];

    // Derive floors & areas from slotCode pattern "FLOOR-AREA-NUM"  e.g. "B2-A-001"
    const floorMap = {};
    const areaMap  = {};

    slots.forEach((s) => {
      // Use bonus fields from mock if available, otherwise parse from slotCode
      const parts     = (s.slotCode || "").split("-");
      const floorCode = s.floorCode  || parts[0] || "–";
      const areaCode  = s.areaCode   || (parts.length >= 2 ? `${parts[0]}-${parts[1]}` : floorCode);

      if (!floorMap[floorCode]) floorMap[floorCode] = { code: floorCode, name: `Tầng ${floorCode}` };
      if (!areaMap[areaCode]) {
        areaMap[areaCode] = {
          id:              s.areaId,
          code:            areaCode,
          floorCode,
          name:            s.areaName || `Khu ${areaCode}`,
          vehicleTypeName: s.vehicleTypeName || null,
          availableSlots:  0,
        };
      }
      areaMap[areaCode].availableSlots += 1;
    });

    return {
      slots,
      floors:       Object.values(floorMap),
      areas:        Object.values(areaMap),
      vehicleTypes: [], // fetched separately via getVehicleTypes()
    };
  },

  // Manager/Common APIs
  getFloors: async () => {
    // For convenience and simplicity, retrieve from /available-slots
    const res = await publicAxiosClient.get("/available-slots");
    return res.success ? res.data.floors : [];
  },

  getAreas: async () => {
    const res = await publicAxiosClient.get("/available-slots");
    return res.success ? res.data.areas : [];
  },

  getSlots: async () => {
    const res = await publicAxiosClient.get("/available-slots");
    return res.success ? res.data.slots : [];
  },

  getGates: async () => {
    const res = await coreAxiosClient.get("/manager/structures/gates");
    return res.success ? res.data : [];
  },

  getVehicleTypes: async () => {
    const res = await publicAxiosClient.get("/vehicle-types");
    return res.success ? res.data : [];
  },

  // Add / Edit structures (Manager actions)
  addFloor: async (floorData) => {
    const res = await coreAxiosClient.post("/manager/structures/floors", floorData);
    if (res.success) return res.data;
    throw new Error(res.message || "Thêm tầng thất bại");
  },

  updateFloor: async (id, floorData) => {
    const res = await coreAxiosClient.put(`/manager/structures/floors/${id}`, floorData);
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật tầng thất bại");
  },

  updateSlotStatus: async (id, status) => {
    const res = await coreAxiosClient.put(`/manager/structures/slots/${id}/status`, { status });
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật slot thất bại");
  }
};
