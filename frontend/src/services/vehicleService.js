import { MOCK_MONTHLY_PASSES } from "../constants/mockData";

const STORAGE_KEY = "parking_monthly_passes";

const initializePasses = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Lỗi phân tích cú pháp vé tháng", e);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_MONTHLY_PASSES));
  return MOCK_MONTHLY_PASSES;
};

export const vehicleService = {
  getMonthlyPasses: () => {
    return initializePasses();
  },

  getVehiclesByOwner: (fullName, phone) => {
    const passes = initializePasses();
    return passes.filter(
      (pass) => pass.ownerName === fullName || pass.phone === phone
    );
  },

  addMonthlyPass: (passData) => {
    const passes = initializePasses();
    const newPass = {
      id: Date.now(),
      ...passData,
      createdAt: new Date().toISOString()
    };
    const updated = [...passes, newPass];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newPass;
  },

  updateMonthlyPassStatus: (passId, newStatus) => {
    const passes = initializePasses();
    const index = passes.findIndex(p => p.id === passId);
    if (index === -1) {
      throw new Error("Không tìm thấy thông tin vé tháng!");
    }
    passes[index].status = newStatus;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passes));
    return passes[index];
  },

  renewMonthlyPass: (passId, newEndDate) => {
    const passes = initializePasses();
    const index = passes.findIndex(p => p.id === passId);
    if (index === -1) {
      throw new Error("Không tìm thấy thông tin vé tháng!");
    }
    passes[index].endDate = newEndDate;
    passes[index].status = "ACTIVE";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passes));
    return passes[index];
  },

  saveMonthlyPasses: (passes) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passes));
  }
};
