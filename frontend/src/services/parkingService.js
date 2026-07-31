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

    const rawSlots = Array.isArray(res.data) ? res.data : [];

    const floorMap = {};
    const areaMap  = {};

    const slots = rawSlots.map((s) => {
      const parts = (s.slotCode || "").split("-");
      const floorCode = s.floorCode || parts[0] || "B";
      let areaCode = s.areaCode;
      if (!areaCode) {
        if (parts.length >= 3) {
          areaCode = `${parts[0]}-${parts[1]}`;
        } else if (parts.length === 2) {
          areaCode = parts[0];
        } else {
          areaCode = floorCode;
        }
      }

      const areaName = s.areaName || `Khu ${areaCode}`;
      let derivedVehicleType = s.vehicleTypeName;
      if (!derivedVehicleType) {
        const codeUpper = String(s.slotCode || areaCode || "").toUpperCase();
        if (codeUpper.includes("BIKE") || codeUpper.startsWith("B1")) {
          derivedVehicleType = "Xe Máy";
        } else {
          derivedVehicleType = "Xe Ô tô";
        }
      }

      if (!floorMap[floorCode]) {
        floorMap[floorCode] = { code: floorCode, name: `Tầng ${floorCode}` };
      }

      if (!areaMap[areaCode]) {
        areaMap[areaCode] = {
          id:              s.areaId || areaCode,
          code:            areaCode,
          floorCode,
          name:            areaName,
          vehicleTypeName: derivedVehicleType,
          availableSlots:  0,
        };
      }
      areaMap[areaCode].availableSlots += 1;

      return {
        ...s,
        floorCode,
        areaCode,
        vehicleTypeName: derivedVehicleType,
      };
    });

    return {
      slots,
      floors:       Object.values(floorMap),
      areas:        Object.values(areaMap),
      vehicleTypes: [],
    };
  },

  // Manager/Common APIs
  getFloors: async () => {
    // API GET ĐÃ CÓ TỪ BACKEND
    const res = await coreAxiosClient.get("/floors");
    return res.success ? res.data : [];
  },

  getAreas: async () => {
    // API GET CHƯA HOÀN THIỆN TỪ BACKEND (Giả lập tạm qua MSW)
    const res = await coreAxiosClient.get("/areas");
    return res.success ? res.data : [];
  },

  getSlots: async () => {
    // API GET CHƯA HOÀN THIỆN TỪ BACKEND (Giả lập tạm qua MSW)
    const res = await coreAxiosClient.get("/slots");
    return res.success ? res.data : [];
  },

  getGates: async (type = "") => {
    const res = await coreAxiosClient.get(`/gates${type ? `?type=${type}` : ""}`);
    return res.success ? res.data : [];
  },

  getVehicleTypes: async () => {
    const res = await coreAxiosClient.get("/vehicle-types");
    return res.success ? res.data : [];
  },

  // Add / Edit structures (Manager actions)
  addFloor: async (floorData) => {
    const res = await coreAxiosClient.post("/floors", floorData);
    if (res.success) return res.data;
    throw new Error(res.message || "Thêm tầng thất bại");
  },

  updateFloor: async (id, floorData) => {
    const res = await coreAxiosClient.put(`/floors/${id}`, floorData);
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật tầng thất bại");
  },

  deleteFloor: async (id) => {
    const res = await coreAxiosClient.delete(`/floors/${id}`);
    if (res.success) return true;
    throw new Error(res.message || "Xóa tầng thất bại");
  },

  addArea: async (areaData) => {
    const res = await coreAxiosClient.post("/areas", areaData);
    if (res.success) return res.data;
    throw new Error(res.message || "Thêm khu vực thất bại");
  },

  updateArea: async (id, areaData) => {
    const res = await coreAxiosClient.put(`/areas/${id}`, areaData);
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật khu vực thất bại");
  },

  addSlot: async (slotData) => {
    const res = await coreAxiosClient.post("/slots", slotData);
    if (res.success) return res.data;
    throw new Error(res.message || "Thêm slot thất bại");
  },

  updateSlotStatus: async (id, status) => {
    const res = await coreAxiosClient.patch(`/slots/${id}/status`, { status });
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật trạng thái slot thất bại");
  }
};
