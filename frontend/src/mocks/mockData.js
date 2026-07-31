/**
 * mockData.js - Dữ liệu giả lập tập trung cho tất cả pages Sprint 1
 * Khi backend sẵn sàng, từng module sẽ thay bằng API call thật (Phase C)
 */

// ===========================================================================
// PARKING INFO
// ===========================================================================
export const MOCK_PARKING_INFO = {
  name: "Bãi Đỗ Xe Tòa Nhà Sky Center",
  status: "OPEN", // OPEN | CLOSED | MAINTENANCE
  address: "12 Tân Thắng, Phường Sơn Kỳ, Quận Tân Phú, TP.HCM",
  hotline: "1800 1234",
  openingHours: "06:00 - 22:00",
  totalFloors: 3,
  totalAreas: 4,
  totalCapacity: 40,
  availableSlots: 20,
  supportNote: "Hỗ trợ khách hàng từ 07:00 - 20:00 các ngày trong tuần. Hệ thống chỉ thực hiện giám sát & quản lý vị trí (slot) đỗ cho Xe Ô Tô tại Tầng B2. Xe Máy (Tầng B1) và Xe Vận Chuyển (Tầng B3) tự quản lý và đỗ theo điều phối.",
  lastUpdated: "2026-05-28T07:00:00Z",
};

// ===========================================================================
// VEHICLE TYPES
// ===========================================================================
export const MOCK_VEHICLE_TYPES = [
  { id: 1, code: "MOTORBIKE", name: "Xe Máy" },
  { id: 2, code: "CAR", name: "Ô Tô" },
  { id: 3, code: "TRANSPORT", name: "Xe Vận Chuyển" },
];

// ===========================================================================
// PUBLIC PRICING
// ===========================================================================
export const MOCK_PRICING_RULES = [
  {
    id: 1,
    vehicleTypeId: 1,
    vehicleTypeName: "Xe Máy",
    dayPrice: 5000,
    nightPrice: 8000,
    monthlyPrice: 300000,
    reservationHourlyPrice: 2000,
    lostCardFee: 50000,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
  },
  {
    id: 2,
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    dayPrice: 20000,
    nightPrice: 30000,
    monthlyPrice: 1200000,
    reservationHourlyPrice: 10000,
    lostCardFee: 100000,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
  },
  {
    id: 3,
    vehicleTypeId: 3,
    vehicleTypeName: "Xe Vận Chuyển",
    dayPrice: 40000,
    nightPrice: 60000,
    monthlyPrice: 2000000,
    reservationHourlyPrice: 12000,
    lostCardFee: 150000,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
  },
];

// ===========================================================================
// FLOORS
// ===========================================================================
export const MOCK_FLOORS = [
  { id: 1, code: "B1", name: "Tầng B1 (Xe Máy)", status: "ACTIVE", totalAreas: 2, totalSlots: 150 },
  { id: 2, code: "B2", name: "Tầng B2 (Ô Tô)", status: "ACTIVE", totalAreas: 2, totalSlots: 40 },
  { id: 3, code: "B3", name: "Tầng B3 (Xe Vận Chuyển)", status: "ACTIVE", totalAreas: 2, totalSlots: 50 },
];

// ===========================================================================
// AREAS
// ===========================================================================
export const MOCK_AREAS = [
  // Tầng B1 (Xe Máy) - Quản lý bằng độ phủ
  { id: 1, floorId: 1, floorCode: "B1", areaCode: "A", code: "B1-A", areaName: "Khu A - Xe Máy Thường", name: "Khu A - Xe Máy Thường", vehicleTypeName: "Xe Máy", vehicleTypeIds: [1], vehicleTypeNames: ["Xe Máy"], priorityOrder: 1, priority: 1, status: "ACTIVE", totalCapacity: 100, maxCapacity: 100, currentCount: 65, isDensityManaged: true },
  { id: 2, floorId: 1, floorCode: "B1", areaCode: "B", code: "B1-B", areaName: "Khu B - Xe Máy Điện", name: "Khu B - Xe Máy Điện", vehicleTypeName: "Xe Máy", vehicleTypeIds: [1], vehicleTypeNames: ["Xe Máy"], priorityOrder: 2, priority: 2, status: "ACTIVE", totalCapacity: 50, maxCapacity: 50, currentCount: 31, isDensityManaged: true },
  
  // Tầng B2 (Xe Ô Tô) - Quản lý bằng Slot
  { id: 3, floorId: 2, floorCode: "B2", areaCode: "A", code: "B2-A", areaName: "Khu A - Ô Tô", name: "Khu A - Ô Tô", vehicleTypeName: "Ô Tô", vehicleTypeIds: [2], vehicleTypeNames: ["Ô Tô"], priorityOrder: 1, priority: 1, status: "ACTIVE", totalCapacity: 20, totalSlots: 20, availableSlots: 13, isDensityManaged: false },
  { id: 4, floorId: 2, floorCode: "B2", areaCode: "B", code: "B2-B", areaName: "Khu B - Ô Tô", name: "Khu B - Ô Tô", vehicleTypeName: "Ô Tô", vehicleTypeIds: [2], vehicleTypeNames: ["Ô Tô"], priorityOrder: 2, priority: 2, status: "ACTIVE", totalCapacity: 20, totalSlots: 20, availableSlots: 7, isDensityManaged: false },
  
  // Tầng B3 (Xe Vận Chuyển) - Quản lý bằng độ phủ
  { id: 5, floorId: 3, floorCode: "B3", areaCode: "A", code: "B3-A", areaName: "Khu A - Xe Tải Nhẹ", name: "Khu A - Xe Tải Nhẹ", vehicleTypeName: "Xe Vận Chuyển", vehicleTypeIds: [3], vehicleTypeNames: ["Xe Vận Chuyển"], priorityOrder: 1, priority: 1, status: "ACTIVE", totalCapacity: 30, maxCapacity: 30, currentCount: 12, isDensityManaged: true },
  { id: 6, floorId: 3, floorCode: "B3", areaCode: "B", code: "B3-B", areaName: "Khu B - Xe Tải Nặng", name: "Khu B - Xe Tải Nặng", vehicleTypeName: "Xe Vận Chuyển", vehicleTypeIds: [3], vehicleTypeNames: ["Xe Vận Chuyển"], priorityOrder: 2, priority: 2, status: "ACTIVE", totalCapacity: 20, maxCapacity: 20, currentCount: 12, isDensityManaged: true }
];

// ===========================================================================
// SLOTS
// ===========================================================================
export const MOCK_SLOTS = [
  // Khu B2-A (20 Slots)
  { id: 1, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-001", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 2, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-002", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 3, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-003", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-101" },
  { id: 4, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-004", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-102" },
  { id: 5, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-005", vehicleTypeName: "Ô Tô", status: "MAINTENANCE" },
  { id: 6, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-006", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 7, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-007", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 8, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-008", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-103" },
  { id: 9, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-009", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 10, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-010", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 11, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-011", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-104" },
  { id: 12, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-012", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 13, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-013", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 14, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-014", vehicleTypeName: "Ô Tô", status: "LOCKED" },
  { id: 15, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-015", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 16, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-016", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 17, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-017", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-105" },
  { id: 18, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-018", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 19, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-019", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 20, areaId: 2, areaCode: "B2-A", floorCode: "B2", code: "B2-A-020", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },

  // Khu B2-B (20 Slots)
  { id: 21, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-001", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 22, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-002", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 23, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-003", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-106" },
  { id: 24, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-004", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-107" },
  { id: 25, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-005", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-108" },
  { id: 26, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-006", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-109" },
  { id: 27, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-007", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-110" },
  { id: 28, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-008", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-111" },
  { id: 29, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-009", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-112" },
  { id: 30, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-010", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-113" },
  { id: 31, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-011", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-114" },
  { id: 32, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-012", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-115" },
  { id: 33, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-013", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-116" },
  { id: 34, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-014", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 35, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-015", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 36, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-016", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 37, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-017", vehicleTypeName: "Ô Tô", status: "OCCUPIED", sessionCode: "SE-20260528-117" },
  { id: 38, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-018", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },
  { id: 39, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-019", vehicleTypeName: "Ô Tô", status: "LOCKED" },
  { id: 40, areaId: 3, areaCode: "B2-B", floorCode: "B2", code: "B2-B-020", vehicleTypeName: "Ô Tô", status: "AVAILABLE" },

  // Khu B1-A (Motorbike slots - 15 slots)
  { id: 41, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-001", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 42, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-002", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 43, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-003", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 44, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-004", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 45, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-005", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 46, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-006", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 47, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-007", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 48, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-008", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 49, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-009", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 50, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-010", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 51, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-011", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 52, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-012", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 53, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-013", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 54, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-014", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 55, areaId: 1, areaCode: "B1-A", floorCode: "B1", code: "B1-A-015", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },

  // Khu B2-C (Motorbike slots - 15 slots)
  { id: 56, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-001", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 57, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-002", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 58, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-003", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 59, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-004", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 60, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-005", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 61, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-006", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 62, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-007", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 63, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-008", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 64, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-009", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 65, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-010", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 66, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-011", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 67, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-012", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 68, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-013", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 69, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-014", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
  { id: 70, areaId: 3, areaCode: "B2-C", floorCode: "B2", code: "B2-C-015", vehicleTypeName: "Xe Máy", status: "AVAILABLE" },
];

// ===========================================================================
// GATES
// ===========================================================================
export const MOCK_GATES = [
  { id: 1, code: "GATE-IN-01", name: "Cổng Vào Chính", type: "ENTRY", floorCode: "B1", status: "ACTIVE" },
  { id: 2, code: "GATE-OUT-01", name: "Cổng Ra Chính", type: "EXIT", floorCode: "B1", status: "ACTIVE" },
  { id: 3, code: "GATE-IN-02", name: "Cổng Vào Phụ", type: "ENTRY", floorCode: "B2", status: "ACTIVE" },
  { id: 4, code: "GATE-OUT-02", name: "Cổng Ra Phụ", type: "EXIT", floorCode: "B2", status: "INACTIVE" },
];

// ===========================================================================
// CARDS
// ===========================================================================
export const MOCK_CARDS = [
  { id: 1, code: "CARD-0001", status: "AVAILABLE", note: "", updatedAt: "2026-05-20T08:00:00Z", activeSession: null },
  { id: 2, code: "CARD-0002", status: "IN_USE", note: "", updatedAt: "2026-05-28T06:30:00Z", activeSession: { sessionCode: "SE-20260528-001", plate: "51A-12345" } },
  { id: 3, code: "CARD-0003", status: "AVAILABLE", note: "Thẻ mới nhập kho", updatedAt: "2026-05-15T10:00:00Z", activeSession: null },
  { id: 4, code: "CARD-0004", status: "LOST", note: "Mất tại cổng B1", updatedAt: "2026-05-10T14:00:00Z", activeSession: null },
  { id: 5, code: "CARD-0005", status: "DAMAGED", note: "Chip bị hỏng", updatedAt: "2026-04-20T09:00:00Z", activeSession: null },
  { id: 6, code: "CARD-0006", status: "AVAILABLE", note: "", updatedAt: "2026-05-18T11:00:00Z", activeSession: null },
  { id: 7, code: "CARD-0007", status: "IN_USE", note: "", updatedAt: "2026-05-28T07:15:00Z", activeSession: { sessionCode: "SE-20260528-002", plate: "59B-99999" } },
  { id: 8, code: "CARD-0008", status: "INACTIVE", note: "Ngừng sử dụng", updatedAt: "2026-03-01T00:00:00Z", activeSession: null },
];

// ===========================================================================
// USERS (Internal)
// ===========================================================================
export const MOCK_USERS = [
  { id: 1, username: "admin01", fullName: "Trần Quản Trị", email: "admin01@parking.vn", phone: "0901000001", role: "ADMIN", status: "ACTIVE" },
  { id: 2, username: "manager01", fullName: "Nguyễn Quản Lý", email: "manager01@parking.vn", phone: "0901000002", role: "MANAGER", status: "ACTIVE" },
  { id: 3, username: "staff01", fullName: "Lê Nhân Viên", email: "staff01@parking.vn", phone: "0901000003", role: "STAFF", status: "ACTIVE" },
  { id: 4, username: "staff02", fullName: "Phạm Thu Hà", email: "staff02@parking.vn", phone: "0901000004", role: "STAFF", status: "ACTIVE" },
  { id: 5, username: "staff03", fullName: "Vũ Hoàng Long", email: "staff03@parking.vn", phone: "0901000005", role: "STAFF", status: "LOCKED" },
  { id: 6, username: "manager02", fullName: "Đặng Thị Mai", email: "manager02@parking.vn", phone: "0901000006", role: "MANAGER", status: "INACTIVE" },
];

// ===========================================================================
// MONTHLY PASSES
// ===========================================================================
export const MOCK_MONTHLY_PASSES = [
  {
    id: 1,
    ownerName: "Nguyễn Văn An",
    phone: "0912345678",
    plate: "51A-12345",
    vehicleTypeId: 1,
    vehicleTypeName: "Xe Máy",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    status: "ACTIVE",
  },
  {
    id: 2,
    ownerName: "Trần Thị Bình",
    phone: "0923456789",
    plate: "59B-99999",
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    status: "ACTIVE",
  },
  {
    id: 3,
    ownerName: "Lê Minh Châu",
    phone: "0934567890",
    plate: "51C-54321",
    vehicleTypeId: 1,
    vehicleTypeName: "Xe Máy",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "EXPIRED",
  },
  {
    id: 4,
    ownerName: "Phạm Đức Dũng",
    phone: "0945678901",
    plate: "51D-11111",
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    startDate: "2026-05-15",
    endDate: "2026-06-14",
    status: "LOCKED",
  },
  {
    id: 5,
    ownerName: "Nguyễn Văn A",
    phone: "0912345678",
    plate: "51A-888.88",
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    status: "ACTIVE",
  },
  {
    id: 6,
    ownerName: "Nguyễn Văn A",
    phone: "0912345678",
    plate: "59B-666.66",
    vehicleTypeId: 2,
    vehicleTypeName: "Ô Tô",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "EXPIRED",
  },
  {
    id: 7,
    ownerName: "Nguyễn Văn A",
    phone: "0912345678",
    plate: "51C-777.77",
    vehicleTypeId: 1,
    vehicleTypeName: "Xe Máy",
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    status: "ACTIVE",
  },
];

// ===========================================================================
// MOTORBIKE OCCUPANCY DENSITY
// ===========================================================================
export const MOCK_MOTORBIKE_OCCUPANCY = {
  currentCount: 96,
  maxCapacity: 150,
  lastUpdated: "2026-06-03T08:00:00Z",
};

