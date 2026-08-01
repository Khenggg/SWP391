import React, { useState, useEffect, useCallback } from "react";
import { parkingService } from "../../services/parkingService";
import { COMMON_STATUS, SLOT_STATUS, STATUS_LABELS } from "@/constants";
import { toast } from "sonner";
import { Layers, Map, Grid } from "lucide-react";
import StructureStatCards from "../../components/manager/structure/StructureStatCards";
import FloorModal from "../../components/manager/structure/FloorModal";
import AreaModal from "../../components/manager/structure/AreaModal";
import SlotModal from "../../components/manager/structure/SlotModal";
import SlotGridPanel from "../../components/manager/structure/SlotGridPanel";
import CapacityPanel from "../../components/manager/structure/CapacityPanel";
import SlotDetailDialog from "../../components/manager/structure/SlotDetailDialog";
import CapacityDialog from "../../components/manager/structure/CapacityDialog";
import FloorTablePanel from "../../components/manager/structure/FloorTablePanel";
import AreaTablePanel from "../../components/manager/structure/AreaTablePanel";


// Constants & Mappings
const AREA_STATUS_BADGE = {
  [COMMON_STATUS.ACTIVE]: "text-emerald-600 bg-emerald-50",
  [SLOT_STATUS.LOCKED]: "text-red-600 bg-red-50",
  [SLOT_STATUS.MAINTENANCE]: "text-amber-600 bg-amber-50",
};

export default function StructureManagementPage() {
  const [activeTab, setActiveTab] = useState("Tầng");
  const [floors, setFloors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStructure = async () => {
    setIsLoading(true);
    try {
      const [floorsData, areasData, slotsData, vTypes, activeSessionsData] = await Promise.all([
        parkingService.getFloors(),
        parkingService.getAreas(),
        parkingService.getSlots(),
        parkingService.getVehicleTypes(),
        parkingService.getActiveSessions(),
      ]);
      setFloors(floorsData || []);
      setAreas(areasData || []);
      
      // Map floor, area, vehicle type, and active session info to slots
      const enrichedAreas = areasData || [];
      const mappedSlots = (slotsData || []).map(slot => {
        const area = enrichedAreas.find(a => a.id === slot.areaId);
        const activeSession = (activeSessionsData || []).find(s => s.slotCode === slot.slotCode);
        if (area) {
          return {
            ...slot,
            areaCode: area.areaCode,
            floorId: area.floorId,
            floorCode: area.floorCode,
            vehicleTypeIds: area.vehicleTypeIds || [],
            vehicleTypeNames: area.vehicleTypeNames || [],
            activeSession: activeSession ? {
              plateNumber: activeSession.plateNumber,
              cardCode: activeSession.cardCode,
              entryTime: activeSession.entryTime,
              sessionCode: activeSession.sessionCode
            } : null
          };
        }
        return {
          ...slot,
          activeSession: activeSession ? {
            plateNumber: activeSession.plateNumber,
            cardCode: activeSession.cardCode,
            entryTime: activeSession.entryTime,
            sessionCode: activeSession.sessionCode
          } : null
        };
      });
      setSlots(mappedSlots);
      
      setVehicleTypes(vTypes || []);
    } catch (e) {
      console.error("Lỗi tải thông tin cấu trúc bãi xe:", e);
      toast.error("Không thể tải thông tin cấu trúc.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  // Stats
  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.status === SLOT_STATUS.AVAILABLE).length;
  const occupiedSlots = slots.filter((s) => s.status === SLOT_STATUS.OCCUPIED).length;
  const maintenanceSlots = slots.filter((s) => s.status === SLOT_STATUS.MAINTENANCE || s.status === SLOT_STATUS.LOCKED).length;

  const percentAvailable = totalSlots ? ((availableSlots / totalSlots) * 100).toFixed(2) : 0;
  const percentOccupied = totalSlots ? ((occupiedSlots / totalSlots) * 100).toFixed(2) : 0;
  const percentMaintenance = totalSlots ? ((maintenanceSlots / totalSlots) * 100).toFixed(2) : 0;

  // Filters
  const [filterFloor, setFilterFloor] = useState("ALL");
  const [filterArea, setFilterArea] = useState("ALL");
  const [filterSlotStatus, setFilterSlotStatus] = useState("ALL");

  // Modals state
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});

  // Slot Detail Sidebar State
  const setField = useCallback((name, value) => setForm((p) => ({ ...p, [name]: value })), []);

  // Capacity Modal State
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedAreaForCapacity, setSelectedAreaForCapacity] = useState(null);
  const [capacityForm, setCapacityForm] = useState({ totalCapacity: 0 });

  const openEditCapacity = (area) => {
    setSelectedAreaForCapacity(area);
    setCapacityForm({ totalCapacity: area.totalCapacity || 0 });
    setShowCapacityModal(true);
  };

  const handleCapacitySave = async () => {
    if (capacityForm.totalCapacity === "" || Number(capacityForm.totalCapacity) < 0) {
      return toast.error("Vui lòng nhập sức chứa hợp lệ");
    }
    try {
      await parkingService.updateArea(selectedAreaForCapacity.id, {
        ...selectedAreaForCapacity,
        totalCapacity: Number(capacityForm.totalCapacity)
      });
      await fetchStructure();
      setShowCapacityModal(false);
      toast.success("Cập nhật sức chứa thành công!");
    } catch (e) {
      toast.error(e.message || "Lỗi cập nhật sức chứa");
    }
  };

  // --- ACTIONS ---
  const openCreateFloor = () => { setEditingItem(null); setForm({ floorCode: "", floorName: "", vehicleTypeIds: [], status: COMMON_STATUS.ACTIVE }); setShowFloorModal(true); };
  const openEditFloor = (floor) => { setEditingItem(floor); setForm({ floorCode: floor.code || floor.floorCode, floorName: floor.name || floor.floorName, vehicleTypeIds: floor.vehicleTypeIds || [], status: floor.status }); setShowFloorModal(true); };
  const handleDeleteFloor = async (floorId, isHardDelete = false) => {
    try {
      await parkingService.deleteFloor(floorId, isHardDelete);
      await fetchStructure();
      toast.success(isHardDelete ? "Xóa vĩnh viễn tầng thành công!" : "Chuyển tầng sang Ngừng hoạt động thành công!");
    } catch (e) {
      toast.error(e.message || "Xóa tầng thất bại");
    }
  };
  const handleFloorSave = async () => {
    if (!form.floorCode || !form.floorName) return toast.error("Vui lòng điền đủ Mã tầng và Tên tầng");
    try {
      if (editingItem) await parkingService.updateFloor(editingItem.id, form);
      else await parkingService.addFloor(form);
      await fetchStructure();
      setShowFloorModal(false);
      toast.success("Lưu tầng thành công!");
    } catch (e) { toast.error(e.message || "Lỗi lưu tầng"); }
  };

  const openCreateArea = () => { setEditingItem(null); setForm({ floorId: "", areaCode: "", areaName: "", priorityOrder: 1, totalCapacity: 10, vehicleTypeIds: [], status: "ACTIVE" }); setShowAreaModal(true); };
  const openEditArea = (area) => { setEditingItem(area); setForm({ floorId: area.floorId || "", areaCode: area.areaCode, areaName: area.areaName, priorityOrder: area.priorityOrder || 1, totalCapacity: area.totalCapacity || 10, vehicleTypeIds: area.vehicleTypeIds || [], status: area.status || "ACTIVE" }); setShowAreaModal(true); };
  const handleAreaSave = async () => {
    if (!form.areaCode || !form.areaName || !form.floorId) return toast.error("Vui lòng điền đủ Mã khu, Tên khu và chọn Tầng");
    try {
      // Auto-set capacity for car areas based on slot count
      const isCar = form.vehicleTypeIds && form.vehicleTypeIds.length > 0
        ? form.vehicleTypeIds.some(id => {
            const vt = vehicleTypes.find(v => v.id === id);
            return vt?.requiresSlot ?? false;
          })
        : false;
      
      const payload = {
        ...form,
        totalCapacity: isCar 
          ? (editingItem ? slots.filter(s => s.areaId === editingItem.id).length : 0)
          : Number(form.totalCapacity || 0)
      };

      if (editingItem) await parkingService.updateArea(editingItem.id, payload);
      else await parkingService.addArea(payload);
      await fetchStructure();
      setShowAreaModal(false);
      toast.success("Lưu khu vực thành công!");
    } catch (e) { toast.error(e.message || "Lỗi lưu khu vực"); }
  };

  const openCreateSlot = () => { setEditingItem(null); setForm({ areaId: "", slotCode: "", allowedVehicleTypeId: "" }); setShowSlotModal(true); };
  const handleSlotSave = async () => {
    if (!form.slotCode || !form.areaId || !form.allowedVehicleTypeId) return toast.error("Vui lòng điền đủ thông tin Slot");
    try {
      await parkingService.addSlot(form);
      
      // Auto-sync the area's totalCapacity with the new slot count to ensure check-in works
      const area = areas.find(a => a.id === form.areaId);
      if (area) {
        const areaSlotsCount = slots.filter(s => s.areaId === area.id).length;
        await parkingService.updateArea(area.id, {
          ...area,
          totalCapacity: areaSlotsCount + 1
        });
      }
      
      await fetchStructure();
      setShowSlotModal(false);
      toast.success("Thêm slot thành công!");
    } catch (e) { toast.error(e.message || "Lỗi thêm slot"); }
  };

  // Slot Detail Dialog State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");

  const handleUpdateSlotStatus = async () => {
    if (!selectedSlot || !targetStatus) return;
    try {
      await parkingService.updateSlotStatus(selectedSlot.id, targetStatus);
      await fetchStructure();
      setSelectedSlot(null); // Close dialog on success
      toast.success("Cập nhật trạng thái thành công!");
    } catch (e) { toast.error(e.message || "Lỗi cập nhật trạng thái"); }
  };

  const isCarArea = (area) => {
    if (area.vehicleTypeIds && area.vehicleTypeIds.length > 0) {
      return area.vehicleTypeIds.some(vtId => {
        const vt = vehicleTypes.find(v => v.id === vtId);
        return vt?.requiresSlot ?? false;
      });
    }
    return (area.vehicleTypeNames || []).some(name => name.toLowerCase().includes("ô tô") || name.toLowerCase().includes("o to"));
  };

  // Filtered Data
  const filteredAreas = filterFloor === "ALL" ? areas : areas.filter((a) => a.floorId?.toString() === filterFloor);
  
  // Filter slots for Ô tô only using requiresSlot property
  const carSlots = slots.filter(s => {
    if (s.allowedVehicleTypeId) {
      const vt = vehicleTypes.find(v => v.id === s.allowedVehicleTypeId);
      return vt?.requiresSlot ?? false;
    }
    if (s.vehicleTypeIds && s.vehicleTypeIds.length > 0) {
      return s.vehicleTypeIds.some(vtId => {
        const vt = vehicleTypes.find(v => v.id === vtId);
        return vt?.requiresSlot ?? false;
      });
    }
    return (s.vehicleTypeNames || []).some(name => name.toLowerCase().includes("ô tô") || name.toLowerCase().includes("o to"));
  });
  const filteredSlots = carSlots.filter((s) => {
    const matchFloor = filterFloor === "ALL" || s.floorId?.toString() === filterFloor;
    const matchArea = filterArea === "ALL" || s.areaId?.toString() === filterArea;
    const matchStatus = filterSlotStatus === "ALL" || s.status === filterSlotStatus;
    return matchFloor && matchArea && matchStatus;
  });

  // Areas for non-car vehicles (Xe máy, xe điện, xe đạp...)
  const nonCarAreas = areas.filter(a => !isCarArea(a));
  const filteredNonCarAreas = nonCarAreas.filter((a) => {
    const matchFloor = filterFloor === "ALL" || a.floorId?.toString() === filterFloor;
    return matchFloor;
  });

  return (
    <div className="space-y-6 max-w-full overflow-hidden bg-[#f8fafc] min-h-screen p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Cấu trúc Bãi xe</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý tầng, khu vực và trạng thái các slot trong hệ thống bãi xe.</p>
      </div>

      {/* Stats Cards */}
      <StructureStatCards 
        floorsCount={floors.length}
        areasCount={areas.length}
        totalSlots={totalSlots}
        availableSlots={availableSlots}
        occupiedSlots={occupiedSlots}
        maintenanceSlots={maintenanceSlots}
        percentAvailable={percentAvailable}
        percentOccupied={percentOccupied}
        percentMaintenance={percentMaintenance}
      />

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col">
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 px-6">
          {["Tầng", "Khu vực", "Slot"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-semibold text-sm transition-all border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === "Tầng" && <Layers className="w-4 h-4" />}
                {tab === "Khu vực" && <Map className="w-4 h-4" />}
                {tab === "Slot" && <Grid className="w-4 h-4" />}
                {tab}
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 flex flex-col">
          
          {/* TẦNG TAB */}
          {activeTab === "Tầng" && (
            <FloorTablePanel
              floors={floors}
              openEditFloor={openEditFloor}
              openCreateFloor={openCreateFloor}
              onDeleteFloor={handleDeleteFloor}
              AREA_STATUS_BADGE={AREA_STATUS_BADGE}
              STATUS_LABELS={STATUS_LABELS}
            />
          )}

          {/* KHU VỰC TAB */}
          {activeTab === "Khu vực" && (
            <AreaTablePanel
              filterFloor={filterFloor}
              setFilterFloor={setFilterFloor}
              floors={floors}
              filteredAreas={filteredAreas}
              openCreateArea={openCreateArea}
              openEditArea={openEditArea}
            />
          )}

          {/* SLOT TAB */}
          {activeTab === "Slot" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
              <SlotGridPanel
                filterFloor={filterFloor}
                setFilterFloor={setFilterFloor}
                filterArea={filterArea}
                setFilterArea={setFilterArea}
                filterSlotStatus={filterSlotStatus}
                setFilterSlotStatus={setFilterSlotStatus}
                floors={floors}
                areas={areas}
                filteredSlots={filteredSlots}
                openCreateSlot={openCreateSlot}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                setTargetStatus={setTargetStatus}
                setStatusReason={setStatusReason}
                isCarArea={isCarArea}
              />

              <CapacityPanel
                filteredNonCarAreas={filteredNonCarAreas}
                openEditCapacity={openEditCapacity}
              />
            </div>
          )}

        </div>
      </div>

      {/* --- MODALS --- */}
      <FloorModal 
        isOpen={showFloorModal}
        onClose={setShowFloorModal}
        editingItem={editingItem}
        form={form}
        setField={setField}
        handleSave={handleFloorSave}
        vehicleTypes={vehicleTypes}
      />

      <AreaModal 
        isOpen={showAreaModal}
        onClose={setShowAreaModal}
        editingItem={editingItem}
        form={form}
        setField={setField}
        handleSave={handleAreaSave}
        floors={floors}
        vehicleTypes={vehicleTypes}
        onVehicleTypeCreated={fetchStructure}
      />

      <SlotModal 
        isOpen={showSlotModal}
        onClose={setShowSlotModal}
        form={form}
        setField={setField}
        handleSave={handleSlotSave}
        areas={areas.filter(isCarArea)}
        vehicleTypes={vehicleTypes}
        floors={floors}
      />

      <SlotDetailDialog
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        targetStatus={targetStatus}
        setTargetStatus={setTargetStatus}
        statusReason={statusReason}
        setStatusReason={setStatusReason}
        handleUpdateSlotStatus={handleUpdateSlotStatus}
      />

      <CapacityDialog
        isOpen={showCapacityModal}
        onClose={setShowCapacityModal}
        selectedAreaForCapacity={selectedAreaForCapacity}
        capacityForm={capacityForm}
        setCapacityForm={setCapacityForm}
        handleCapacitySave={handleCapacitySave}
      />
    </div>
  );
}
