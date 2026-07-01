import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, notFound, enabled } from "./helpers";
import { db } from "./db";
import { sessionDb } from "./sessionUtils";
let mockDashboardRevenue = 3980000;
let mockDashboardEntries = 187;
let mockDashboardExits = 172;
let mockDashboardIncidents = 2;
let mockRecentActivities = [
  { type: "Ô Tô", plate: "30F-888.88", gate: "GATE-IN-01", time: "22:40:15" },
  { type: "Xe Máy", plate: "29H1-123.45", gate: "GATE-IN-02", time: "22:38:10" },
  { type: "Ô Tô", plate: "51K-999.99", gate: "GATE-IN-01", time: "22:35:45" },
  { type: "Xe Máy", plate: "43C1-567.89", gate: "GATE-IN-02", time: "22:32:00" },
];

export const managerHandlers = [
  // =========================================================================
  // MANAGER CARD MANAGEMENT
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_CARDS,
    http.get(`${API_BASE_URLS.core}/cards`, async () => {
      await delay(250);
      return ok(db.getCards());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_CARDS,
    http.post(`${API_BASE_URLS.core}/cards`, async ({ request }) => {
      await delay(250);
      const { cardNumber, note } = await request.json();
      const code = cardNumber;
      let inMemoryCards = db.getCards();
      
      if (inMemoryCards.some(c => c.code.trim().toUpperCase() === code.trim().toUpperCase())) {
        return badRequest("Mã thẻ này đã tồn tại trên hệ thống!");
      }
      const newCard = {
        id: Date.now(),
        code: code.trim(),
        status: "AVAILABLE",
        note: note || "",
        updatedAt: new Date().toISOString(),
        activeSession: null
      };
      inMemoryCards.push(newCard);
      db.saveCards(inMemoryCards);
      return ok(newCard);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_CARDS,
    http.patch(`${API_BASE_URLS.core}/cards/:id/status`, async ({ params, request }) => {
      await delay(250);
      const cardId = Number(params.id);
      const status = await request.json(); // It comes as raw string from the new cardService
      
      let inMemoryCards = db.getCards();
      const index = inMemoryCards.findIndex(c => c.id === cardId);
      if (index === -1) return notFound("Không tìm thấy thẻ xe.");

      if (inMemoryCards[index].status === "IN_USE" && status !== "IN_USE") {
        return badRequest("Không thể cập nhật trạng thái của thẻ đang sử dụng!");
      }

      inMemoryCards[index].status = status;
      inMemoryCards[index].updatedAt = new Date().toISOString();
      db.saveCards(inMemoryCards);
      return ok(inMemoryCards[index]);
    })
  ),

  // =========================================================================
  


  // MANAGER MONTHLY PASSES
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.get(`${API_BASE_URLS.core}/monthly-passes`, async () => {
      await delay(250);
      return ok(db.getMonthlyPasses());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.post(`${API_BASE_URLS.core}/monthly-passes`, async ({ request }) => {
      await delay(250);
      const passData = await request.json();
      let inMemoryPasses = db.getMonthlyPasses();
      const newPass = {
        id: Date.now(),
        ...passData,
        createdAt: new Date().toISOString()
      };
      inMemoryPasses.push(newPass);
      db.saveMonthlyPasses(inMemoryPasses);
      return ok(newPass);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.patch(`${API_BASE_URLS.core}/monthly-passes/:id/status`, async ({ params, request }) => {
      await delay(250);
      const passId = Number(params.id);
      const { status } = await request.json();
      
      let inMemoryPasses = db.getMonthlyPasses();
      const index = inMemoryPasses.findIndex(p => p.id === passId);
      if (index === -1) return notFound("Không tìm thấy vé tháng.");

      inMemoryPasses[index].status = status;
      db.saveMonthlyPasses(inMemoryPasses);
      return ok(inMemoryPasses[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.post(`${API_BASE_URLS.core}/monthly-passes/:id/renew`, async ({ params, request }) => {
      await delay(250);
      const passId = Number(params.id);
      const { endDate } = await request.json();
      
      let inMemoryPasses = db.getMonthlyPasses();
      const index = inMemoryPasses.findIndex(p => p.id === passId);
      if (index === -1) return notFound("Không tìm thấy vé tháng.");

      inMemoryPasses[index].endDate = endDate;
      inMemoryPasses[index].status = "ACTIVE";
      db.saveMonthlyPasses(inMemoryPasses);
      return ok(inMemoryPasses[index]);
    })
  ),

  // =========================================================================
  // MANAGER STRUCTURES
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/floors`, async () => {
      await delay(250);
      return ok(db.getFloors());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.post(`${API_BASE_URLS.core}/floors`, async ({ request }) => {
      await delay(250);
      const floorData = await request.json();
      let inMemoryFloors = db.getFloors();
      const newFloor = {
        id: Date.now(),
        ...floorData,
        totalAreas: 0,
        totalSlots: 0
      };
      inMemoryFloors.push(newFloor);
      db.saveFloors(inMemoryFloors);
      return ok(newFloor);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.put(`${API_BASE_URLS.core}/floors/:id`, async ({ params, request }) => {
      await delay(250);
      const floorId = Number(params.id);
      const floorData = await request.json();
      
      let inMemoryFloors = db.getFloors();
      const index = inMemoryFloors.findIndex(f => f.id === floorId);
      if (index === -1) return notFound("Không tìm thấy tầng.");

      inMemoryFloors[index] = { ...inMemoryFloors[index], ...floorData };
      db.saveFloors(inMemoryFloors);
      return ok(inMemoryFloors[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/areas`, async () => {
      await delay(250);
      return ok(db.getAreas());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.post(`${API_BASE_URLS.core}/areas`, async ({ request }) => {
      await delay(250);
      const areaData = await request.json();
      let inMemoryAreas = db.getAreas();
      const newArea = {
        id: Date.now(),
        ...areaData,
        totalSlots: 0,
        availableSlots: 0
      };
      inMemoryAreas.push(newArea);
      db.saveAreas(inMemoryAreas);
      return ok(newArea);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.put(`${API_BASE_URLS.core}/areas/:id`, async ({ params, request }) => {
      await delay(250);
      const areaId = Number(params.id);
      const areaData = await request.json();
      
      let inMemoryAreas = db.getAreas();
      const index = inMemoryAreas.findIndex(a => a.id === areaId);
      if (index === -1) return notFound("Không tìm thấy khu vực.");

      inMemoryAreas[index] = { ...inMemoryAreas[index], ...areaData };
      db.saveAreas(inMemoryAreas);
      return ok(inMemoryAreas[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/slots`, async () => {
      await delay(250);
      return ok(db.getSlots());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.post(`${API_BASE_URLS.core}/slots`, async ({ request }) => {
      await delay(250);
      const slotData = await request.json();
      let inMemorySlots = db.getSlots();
      const newSlot = {
        id: Date.now(),
        ...slotData,
        status: "AVAILABLE"
      };
      inMemorySlots.push(newSlot);
      db.saveSlots(inMemorySlots);
      return ok(newSlot);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.patch(`${API_BASE_URLS.core}/slots/:id/status`, async ({ params, request }) => {
      await delay(250);
      const slotId = Number(params.id);
      const { status } = await request.json();

      let inMemorySlots = db.getSlots();
      const index = inMemorySlots.findIndex(s => s.id === slotId);
      if (index === -1) return notFound("Không tìm thấy slot.");

      inMemorySlots[index].status = status;
      db.saveSlots(inMemorySlots);
      return ok(inMemorySlots[index]);
    })
  ),

  // =========================================================================
  // MANAGER PRICING
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_PRICING,
    http.get(`${API_BASE_URLS.core}/pricing-rules`, async () => {
      await delay(250);
      return ok(db.getPricingRules());
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PRICING,
    http.post(`${API_BASE_URLS.core}/pricing-rules`, async ({ request }) => {
      await delay(250);
      const ruleData = await request.json();
      let inMemoryPricingRules = db.getPricingRules();
      const newRule = {
        id: Date.now(),
        ...ruleData,
        updatedAt: new Date().toISOString()
      };
      inMemoryPricingRules.push(newRule);
      db.savePricingRules(inMemoryPricingRules);
      return ok(newRule);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PRICING,
    http.put(`${API_BASE_URLS.core}/pricing-rules/:id`, async ({ params, request }) => {
      await delay(250);
      const ruleId = Number(params.id);
      const ruleData = await request.json();

      let inMemoryPricingRules = db.getPricingRules();
      const index = inMemoryPricingRules.findIndex(r => r.id === ruleId);
      if (index === -1) return notFound("Không tìm thấy bảng giá.");

      inMemoryPricingRules[index] = {
        ...inMemoryPricingRules[index],
        ...ruleData,
        updatedAt: new Date().toISOString()
      };
      db.savePricingRules(inMemoryPricingRules);
      return ok(inMemoryPricingRules[index]);
    })
  ),

  // =========================================================================
  // MANAGER DASHBOARD (LIVE SIMULATION)
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_DASHBOARD,
    http.get(`${API_BASE_URLS.support}/dashboard`, async () => {
      await delay(250);
      
      // Count actual maintenance/locked slots from db to sync with Structures page
      const allSlots = db.getSlots();
      const maintenanceCount = allSlots.filter(s => s.status === 'MAINTENANCE' || s.status === 'LOCKED').length;

      // Simulate real-time increment on some requests
      if (Math.random() > 0.4) {
        mockDashboardRevenue += Math.floor(Math.random() * 4) * 5000;
        mockDashboardEntries += Math.random() > 0.6 ? 1 : 0;
        mockDashboardExits += Math.random() > 0.65 ? 1 : 0;
      }

      const total = 1000;
      const activeSessions = 350;
      const available = total - activeSessions - maintenanceCount;

      const lostCardPending = sessionDb.getLostCards().filter(c => c.status === "PENDING").length;
      const plateMismatchPending = sessionDb.getMismatch().filter(c => c.status === "PENDING").length;

      return ok({
        slot: {
          total: total,
          available: available,
          occupied: activeSessions,
          reserved: 0,
          locked: 0,
          maintenance: maintenanceCount
        },
        traffic: {
          entriesToday: mockDashboardEntries,
          exitsToday: mockDashboardExits,
          activeSessions: 350
        },
        revenue: {
          todayRevenue: mockDashboardRevenue
        },
        card: {
          available: 100,
          inUse: 350,
          lost: 2,
          damaged: 1,
          inactive: 0
        },
        pending: {
          lostCardPending: lostCardPending,
          plateMismatchPending: plateMismatchPending,
          totalPending: lostCardPending + plateMismatchPending
        }
      });
    })
  ),
    // =========================================================================
    // SUPPORT REPORTS
    // =========================================================================
    ...enabled(
      MOCK_FLAGS.MANAGER_DASHBOARD,
      http.get(`${API_BASE_URLS.support}/reports/revenue`, async () => {
        return ok({
          totalRevenue: 285250000,
          totalPayments: 15000,
          paidPayments: 14900,
          pendingPayments: 100,
          cancelledPayments: 0,
        });
      })
    ),
    ...enabled(
      MOCK_FLAGS.MANAGER_DASHBOARD,
      http.get(`${API_BASE_URLS.support}/reports/traffic`, async () => {
        return ok({
          totalEntries: 12548,
          totalExits: 12127,
          activeSessions: 1286,
          completedSessions: 12127,
        });
      })
    ),
    ...enabled(
      MOCK_FLAGS.MANAGER_DASHBOARD,
      http.get(`${API_BASE_URLS.support}/reports/occupancy`, async () => {
        return ok({
          totalCapacity: 1880,
          occupied: 1286,
          reserved: 0,
          available: 594,
          occupancyRate: 68.4,
        });
      })
    ),
    ...enabled(
      MOCK_FLAGS.MANAGER_DASHBOARD,
      http.get(`${API_BASE_URLS.support}/reports/card-session`, async () => {
        return ok({
          summary: {
            available: 1000,
            inUse: 1286,
            lost: 36,
            damaged: 10,
            inactive: 5,
          },
          sessions: [],
        });
      })
    ),
  ...enabled(
    MOCK_FLAGS.MANAGER_DASHBOARD,
    http.get(`${API_BASE_URLS.support}/audit-logs`, async () => {
      return ok({
        items: [
          { id: 1, timestamp: "2025-06-21T14:28:35", action: "ENTRY", targetId: "IN250621142835", plate: "30F-123.45", slot: "B1 - A03", username: "Trần Minh Đức", status: "SUCCESS" },
          { id: 2, timestamp: "2025-06-21T14:22:11", action: "EXIT", targetId: "OUT250621142211", plate: "51H-567.89", slot: "B2 - B12", username: "Lê Hoàng Nam", status: "SUCCESS" },
          { id: 3, timestamp: "2025-06-21T14:18:45", action: "LOST_CARD", targetId: "LT250621141845", plate: "-", slot: "B3 - Khu C", username: "Phạm Thùy Linh", status: "PENDING" },
          { id: 4, timestamp: "2025-06-21T14:10:02", action: "MISMATCH", targetId: "LP250621141002", plate: "30A-987.65", slot: "Tầng 1 - D05", username: "Nguyễn Văn Huy", status: "VERIFYING" },
          { id: 5, timestamp: "2025-06-21T14:05:17", action: "MAINTENANCE", targetId: "MT250621140517", plate: "-", slot: "B1 - A10", username: "Kỹ thuật 01", status: "PROCESSING" }
        ],
        page: 1, size: 5, totalElements: 5, totalPages: 1
      });
    })
  ),
];
