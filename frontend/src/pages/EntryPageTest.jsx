import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  CreditCard, 
  RefreshCw, 
  Plus, 
  Check, 
  CheckCircle, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  ChevronDown, 
  AlertTriangle, 
  AlertCircle, 
  Eye, 
  Play, 
  CheckSquare, 
  Square,
  QrCode,
  Info,
  LogIn
} from 'lucide-react';

// Import official shadcn/ui components from the project
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

// Custom inline SVG icons matching the mockup
const ScooterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M18 15V7a2 2 0 0 0-2-2H9" />
    <path d="m9 5-2 4h4" />
    <path d="M6 15h12" />
  </svg>
);

const CarFrontIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 14h16" />
    <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
    <rect x="3" y="10" width="18" height="10" rx="2" />
    <circle cx="7" cy="15" r="1.2" />
    <circle cx="17" cy="15" r="1.2" />
  </svg>
);

const TruckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const BicycleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="18.5" cy="17.5" r="3.5" />
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="15" cy="5" r="1" />
    <path d="M12 17.5V14H9.5" />
    <path d="m15 5-4.7 10" />
    <path d="M12 8H8.5" />
  </svg>
);

const ColorfulMapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 cursor-pointer">
    <path d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 3V18" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="2 2"/>
    <path d="M15 6V21" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="2 2"/>
    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
    <circle cx="12" cy="10" r="1.5" fill="#FFFFFF"/>
  </svg>
);

const StatusCheckIcon = () => (
  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </div>
);

const StatusAlertIcon = () => (
  <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </div>
);

const MiniParkingIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5 text-emerald-600">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </svg>
);

const BarrierIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Post on left */}
    <path d="M6 20v-9" />
    <path d="M4 20h4" />
    <circle cx="6" cy="11" r="1" />
    {/* Arm extending right */}
    <path d="M7.5 11h11.5" />
    <path d="M11 9.5v3" />
    <path d="M15 9.5v3" />
  </svg>
);

export default function EntryPageTest() {
  // 1. Form States
  const [plateNumber, setPlateNumber] = useState('30F-123.45');
  const [cardCode, setCardCode] = useState('TH-00112345');
  const [vehicleType, setVehicleType] = useState('car'); // motorbike, car, truck, bicycle
  const [driverGroup, setDriverGroup] = useState('resident'); // resident, visitor
  const [gate, setGate] = useState('A1');
  const [entryTime, setEntryTime] = useState('20/05/2025 09:24:18');

  // 2. Interactive & UI States
  const [isBarrierOpen, setIsBarrierOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:24:18');
  const [currentDate, setCurrentDate] = useState('20/05/2025 (Thứ Ba)');
  const [showNotification, setShowNotification] = useState(null); // { type, text }
  const [selectedSuggestion, setSelectedSuggestion] = useState('car'); // car, motorbike, truck

  // 3. System checks state (dynamically computed)
  const isCardValid = cardCode.startsWith('TH-') && cardCode.length >= 8;
  const isPlateValid = plateNumber.trim().length >= 5;
  const isNoDuplicateSession = plateNumber !== '29A-456.78'; // mock check
  const isVehicleTypeValid = ['car', 'motorbike', 'truck'].includes(vehicleType);

  const allChecksPassed = isCardValid && isPlateValid && isNoDuplicateSession && isVehicleTypeValid;

  // 4. Recent Entries List State
  const [recentEntries, setRecentEntries] = useState([
    { plate: '30F-123.45', type: 'car', gate: 'Cổng A1', time: '09:24:18 20/05/2025' },
    { plate: '29A-456.78', type: 'motorbike', gate: 'Cổng A1', time: '09:20:45 20/05/2025' },
    { plate: '51H-789.01', type: 'car', gate: 'Cổng A2', time: '09:18:32 20/05/2025' },
    { plate: '15C-345.67', type: 'truck', gate: 'Cổng B1', time: '09:15:10 20/05/2025' },
    { plate: '43B-234.56', type: 'car', gate: 'Cổng A1', time: '09:12:05 20/05/2025' }
  ]);

  // 5. Booking Info matching the current plate
  const hasBooking = plateNumber.toUpperCase().replace(/[-.]/g, '') === '30F12345';

  // Live Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync suggestion selection with vehicle type selection
  useEffect(() => {
    if (vehicleType === 'car') setSelectedSuggestion('car');
    else if (vehicleType === 'motorbike') setSelectedSuggestion('motorbike');
    else if (vehicleType === 'truck') setSelectedSuggestion('truck');
    else if (vehicleType === 'bicycle') setSelectedSuggestion('motorbike');
  }, [vehicleType]);

  // Format Helper
  const getVehicleLabel = (type) => {
    switch (type) {
      case 'car': return 'Ô tô';
      case 'motorbike': return 'Xe máy';
      case 'truck': return 'Xe tải';
      case 'bicycle': return 'Xe đạp';
      default: return 'Khác';
    }
  };

  // Actions
  const handleOpenBarrier = () => {
    setIsBarrierOpen(true);
    triggerNotification('success', 'Đã gửi lệnh mở barrier thành công!');
    setTimeout(() => setIsBarrierOpen(false), 5000);
  };

  const handleCreateSession = () => {
    if (!allChecksPassed) {
      triggerNotification('error', 'Không thể tạo phiên! Vui lòng kiểm tra lại hệ thống.');
      return;
    }
    // Add to recent entries
    const newEntry = {
      plate: plateNumber,
      type: vehicleType,
      gate: `Cổng ${gate}`,
      time: `${currentTime} 20/05/2025`
    };
    setRecentEntries([newEntry, ...recentEntries.slice(0, 4)]);
    triggerNotification('success', `Đã tạo phiên đỗ xe thành công cho biển số ${plateNumber}!`);
  };

  const triggerNotification = (type, text) => {
    setShowNotification({ type, text });
    setTimeout(() => setShowNotification(null), 4500);
  };

  const handleRecheck = () => {
    triggerNotification('info', 'Đang quét lại dữ liệu và kiểm tra hệ thống...');
  };

  const handleScanPlate = () => {
    setPlateNumber('30F-123.45');
    triggerNotification('success', 'Nhận diện biển số hoàn tất: 30F-123.45');
  };

  const handleScanCard = () => {
    setCardCode('TH-00112345');
    triggerNotification('success', 'Đã quét thẻ: TH-00112345');
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-800 font-sans p-3 flex flex-col overflow-hidden">
      {/* Toast Notification */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 border ${
          showNotification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          showNotification.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {showNotification.type === 'success' && <CheckCircle className="h-6 w-6 text-emerald-600 animate-bounce shrink-0" />}
          {showNotification.type === 'error' && <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />}
          {showNotification.type === 'info' && <RefreshCw className="h-6 w-6 text-blue-600 animate-spin shrink-0" />}
          <span className="font-semibold text-sm">{showNotification.text}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 pb-2 mb-2 border-b border-slate-200 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Xe vào
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Quản lý phương tiện ra vào bãi xe</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Active Gate Box */}
          <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <LogIn className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cổng vào</p>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-blue-600">Cổng {gate}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Time Clock Box */}
          <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs min-w-[180px]">
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-none">{currentTime}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">{currentDate}</p>
            </div>
          </div>

          {/* User Profile Box */}
          <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs ml-auto lg:ml-0">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">Nguyễn Văn An</p>
              <p className="text-[10px] font-medium text-slate-400">Nhân viên trực</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1 cursor-pointer" />
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-2 flex-1 min-h-0">
        
        {/* Top Split Layout: 3/4 left grid of steps, 1/4 right Booking detail */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 flex-1 min-h-0">
          
          {/* ================= LEFT COLUMN: STEPS 1, 2, 3, 4 (3/4 Width) ================= */}
          <section className="lg:col-span-3 flex flex-col gap-2 h-full min-h-0">
            
            {/* ROW 1: Steps 1 & 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-[6.0] min-h-0">
              {/* Step 1 (Camera nhận diện) - 50% width (6/12 cols) */}
              <div className="lg:col-span-6 flex flex-col h-full min-h-0">
                <Card className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col p-0 gap-0 h-full min-h-0">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 w-full shrink-0">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px]">1</span>
                      <h3 className="font-bold text-slate-800 text-sm">Camera nhận diện</h3>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Badge Biển số đã nhận diện */}
                      <Badge variant={isPlateValid ? "default" : "outline"} className={`h-5.5 text-[9.5px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-none transition-all ${
                        isPlateValid ? 'bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-transparent'
                      }`}>
                        {isPlateValid ? (
                          <CheckSquare className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Square className="w-3 h-3 text-slate-400" />
                        )}
                        Biển số đã nhận diện
                      </Badge>
                      {/* Badge Thẻ hợp lệ */}
                      <Badge variant={isCardValid ? "default" : "outline"} className={`h-5.5 text-[9.5px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-none transition-all ${
                        isCardValid ? 'bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-transparent'
                      }`}>
                        <CreditCard className={`w-3 h-3 ${isCardValid ? 'text-emerald-600' : 'text-slate-400'}`} />
                        Thẻ hợp lệ
                      </Badge>
                      {/* Badge Sẵn sàng tạo phiên */}
                      <Badge variant={allChecksPassed ? "default" : "outline"} className={`h-5.5 text-[9.5px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-none transition-all ${
                        allChecksPassed ? 'bg-indigo-50 hover:bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-100 text-slate-400 border-transparent'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${allChecksPassed ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`}></span>
                        Sẵn sàng tạo phiên
                      </Badge>
                    </div>
                  </div>

                  {/* Video Feed Box */}
                  <div className="relative bg-slate-950 flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden group">
                    {/* Car Camera Feed Mockup */}
                    <img 
                      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80" 
                      alt="Camera feed" 
                      className="w-full h-full object-cover opacity-80"
                    />
                    
                    {/* Camera Info Overlay */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      <span>CAM_ENTRY_01 - LIVE</span>
                    </div>

                    {/* Gate Tag Indicator */}
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 rounded shadow-md">
                      {gate}
                    </div>

                    {/* Plate Bounding Box Detection overlay */}
                    {isPlateValid && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 border border-emerald-500 bg-black/75 rounded-md px-3 py-1 text-center shadow-lg backdrop-blur-xs">
                        <p className="text-white text-base font-black tracking-wider leading-none">{plateNumber}</p>
                        <p className="text-emerald-400 text-[9px] font-bold mt-0.5 tracking-widest uppercase">CONFIDENCE: 96%</p>
                      </div>
                    )}

                    {/* Barrier status indicator overlay */}
                    {isBarrierOpen && (
                      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex items-center justify-center">
                        <div className="bg-emerald-600 text-white font-black text-sm px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
                          <CheckCircle className="w-5 h-5" />
                          CỔNG ĐANG MỞ (BARRIER OPEN)
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Step 2 (Thông tin xe vào) - 50% width (6/12 cols) */}
              <div className="lg:col-span-6 flex flex-col h-full min-h-0">
                <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 flex flex-col gap-2.5 h-full min-h-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</div>
                    <h3 className="font-extrabold text-slate-805 text-sm">Thông tin xe vào</h3>
                  </div>

                  {/* Form - Side by side label and input layout matching mockup */}
                  <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 justify-start mt-1">
                    
                    {/* Row 1: License Plate */}
                    <div className="flex items-center gap-2">
                      <label className="text-slate-700 text-xs font-bold w-24 shrink-0">Biển số <span className="text-rose-500">*</span></label>
                      <Input 
                        type="text" 
                        value={plateNumber} 
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="h-9 flex-1 px-3 rounded-lg font-bold text-xs focus-visible:border-blue-500 focus-visible:ring-blue-100 text-slate-800 border-slate-200"
                        placeholder="30F-123.45"
                      />
                    </div>

                    {/* Row 2: Card Code */}
                    <div className="flex items-center gap-2">
                      <label className="text-slate-700 text-xs font-bold w-24 shrink-0">Mã thẻ</label>
                      <div className="relative flex-1">
                        <Input 
                          type="text" 
                          value={cardCode} 
                          onChange={(e) => setCardCode(e.target.value)}
                          className="h-9 w-full px-3 pr-8 rounded-lg font-mono font-bold text-xs focus-visible:border-blue-500 focus-visible:ring-blue-100 text-slate-800 border-slate-200"
                          placeholder="TH-00112345"
                        />
                        {isCardValid && (
                          <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <Check className="h-3 w-3 stroke-[3.5]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Vehicle Type buttons (border-only style matching mockup) */}
                    <div className="flex items-center gap-2">
                      <label className="text-slate-700 text-xs font-bold w-24 shrink-0">Loại xe <span className="text-rose-500">*</span></label>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {[
                          { key: 'motorbike', label: 'Xe máy', icon: ScooterIcon },
                          { key: 'car', label: 'Ô tô', icon: CarFrontIcon },
                          { key: 'truck', label: 'Xe tải', icon: TruckIcon },
                          { key: 'bicycle', label: 'Xe đạp', icon: BicycleIcon }
                        ].map((item) => {
                          const Icon = item.icon;
                          const isActive = vehicleType === item.key;
                          return (
                            <button
                              key={item.key}
                              onClick={() => setVehicleType(item.key)}
                              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                isActive
                                  ? 'border-blue-600 bg-blue-50/20 text-blue-600'
                                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Row 4: Driver Group buttons */}
                    <div className="flex items-center gap-2">
                      <label className="text-slate-700 text-xs font-bold w-24 shrink-0">Nhiệm tài xế <span className="text-rose-500">*</span></label>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {[
                          { key: 'resident', label: 'Cư dân' },
                          { key: 'visitor', label: 'Khách vãng lai' }
                        ].map((item) => {
                          const isActive = driverGroup === item.key;
                          return (
                            <button
                              key={item.key}
                              onClick={() => setDriverGroup(item.key)}
                              className={`px-4 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                isActive
                                  ? 'border-blue-600 bg-blue-50/20 text-blue-600'
                                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <User className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Row 5: Gate selection */}
                    <div className="flex items-center gap-2">
                      <label className="text-slate-700 text-xs font-bold w-24 shrink-0">Cổng vào <span className="text-rose-500">*</span></label>
                      <div className="relative flex-1">
                        <select 
                          value={gate}
                          onChange={(e) => setGate(e.target.value)}
                          className="w-full h-9 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-xs focus:outline-none focus:border-blue-500 appearance-none bg-white text-slate-800 cursor-pointer"
                        >
                          <option value="A1">Cổng A1</option>
                          <option value="A2">Cổng A2</option>
                          <option value="B1">Cổng B1</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Row 6: Time In with calendar on the left */}
                    <div className="flex items-center gap-2">
                      <label className="text-slate-700 text-xs font-bold w-24 shrink-0">Thời gian vào</label>
                      <div className="relative flex-1">
                        <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          type="text" 
                          value={entryTime}
                          onChange={(e) => setEntryTime(e.target.value)}
                          className="h-9 w-full pl-9 pr-3 rounded-lg font-bold text-xs focus-visible:border-blue-500 focus-visible:ring-blue-100 text-slate-800 border-slate-200"
                        />
                      </div>
                    </div>

                    {/* Row 7: Attachments - 2 columns, each taking 50% width, split into label and image */}
                    <div className="grid grid-cols-2 gap-3 mt-1 flex-1 min-h-0">
                      {/* Column 1: Ảnh xe */}
                      <div className="flex flex-col gap-1 min-h-0">
                        <span className="text-slate-700 text-xs font-bold shrink-0">Ảnh xe</span>
                        <div className="w-full flex-1 min-h-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                          <img 
                            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80" 
                            alt="Car attachment" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Column 2: Ảnh biển số */}
                      <div className="flex flex-col gap-1 min-h-0">
                        <span className="text-slate-700 text-xs font-bold shrink-0">Ảnh biển số</span>
                        <div className="w-full flex-1 min-h-0 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 p-2">
                          <div className="bg-white border border-slate-800 px-3 py-1.5 rounded text-slate-900 font-mono font-black tracking-wider text-xs lg:text-[13px] shadow-sm select-none">
                            {plateNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </Card>
              </div>
            </div>

            {/* ROW 2: Steps 3 & 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-[4.0] min-h-0">
              {/* Step 3 (Kiểm tra hệ thống) - 1.25/3 width (5/12 cols) */}
              <div className="lg:col-span-5 flex flex-col h-full min-h-0">
                <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 flex flex-col gap-2.5 h-full min-h-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Kiểm tra hệ thống</h3>
                  </div>

                  {/* Check List - Vertical layout with fixed-height child items */}
                  <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1 mt-1 justify-start">
                    {/* Check 1 */}
                    <div className="flex items-center justify-between px-3 h-10 rounded-lg border border-slate-100 bg-slate-50/20 shrink-0">
                      {isCardValid ? <StatusCheckIcon /> : <StatusAlertIcon />}
                      <div className="flex-1 flex justify-between items-center mx-2.5 text-xs font-bold text-slate-700">
                        <span>{isCardValid ? "Thẻ đang AVAILABLE" : "Thẻ không hợp lệ"}</span>
                        <span className="text-slate-400 font-semibold">{isCardValid ? "Hợp lệ đến 31/12/2025" : "Kiểm tra thẻ"}</span>
                      </div>
                      {isCardValid ? <StatusCheckIcon /> : <StatusAlertIcon />}
                    </div>

                    {/* Check 2 */}
                    <div className="flex items-center justify-between px-3 h-10 rounded-lg border border-slate-100 bg-slate-50/20 shrink-0">
                      {isNoDuplicateSession ? <StatusCheckIcon /> : <StatusAlertIcon />}
                      <div className="flex-1 flex justify-between items-center mx-2.5 text-xs font-bold text-slate-700">
                        <span>{isNoDuplicateSession ? "Không có phiên đang mở" : "Mở trùng phiên đỗ"}</span>
                        <span className="text-slate-400 font-semibold">{isNoDuplicateSession ? "OK" : "Lỗi trùng"}</span>
                      </div>
                      {isNoDuplicateSession ? <StatusCheckIcon /> : <StatusAlertIcon />}
                    </div>

                    {/* Check 3 */}
                    <div className="flex items-center justify-between px-3 h-10 rounded-lg border border-slate-100 bg-slate-50/20 shrink-0">
                      {isVehicleTypeValid ? <StatusCheckIcon /> : <StatusAlertIcon />}
                      <div className="flex-1 flex justify-between items-center mx-2.5 text-xs font-bold text-slate-700">
                        <span>{isVehicleTypeValid ? "Loại xe hợp lệ" : "Loại xe không hợp lệ"}</span>
                        <span className="text-slate-400 font-semibold">{isVehicleTypeValid ? getVehicleLabel(vehicleType) : "Kiểm tra"}</span>
                      </div>
                      {isVehicleTypeValid ? <StatusCheckIcon /> : <StatusAlertIcon />}
                    </div>

                    {/* Check 4 */}
                    <div className="flex items-center justify-between px-3 h-10 rounded-lg border border-slate-100 bg-slate-50/20 shrink-0">
                      {isPlateValid ? <StatusCheckIcon /> : <StatusAlertIcon />}
                      <div className="flex-1 flex justify-between items-center mx-2.5 text-xs font-bold text-slate-700">
                        <span>{isPlateValid ? "Không trùng biển số" : "Thiếu biển số nhận diện"}</span>
                        <span className="text-slate-400 font-semibold">{isPlateValid ? "OK" : "Kiểm tra"}</span>
                      </div>
                      {isPlateValid ? <StatusCheckIcon /> : <StatusAlertIcon />}
                    </div>

                    {/* Status Banner */}
                    <div className={`flex items-center gap-2 px-3 h-10 rounded-lg border shrink-0 ${
                      allChecksPassed 
                        ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                        : 'bg-rose-50/50 border-rose-100 text-rose-800'
                    }`}>
                      {allChecksPassed ? (
                        <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      ) : (
                        <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 stroke-[2.5]" />
                      )}
                      <span className="font-bold text-[11px] leading-tight">
                        {allChecksPassed 
                          ? "Tất cả điều kiện kiểm tra đều hợp lệ. Có thể tạo phiên đỗ xe."
                          : "Điều kiện kiểm tra chưa hợp lệ. Vui lòng kiểm tra lại."
                        }
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Step 4 (Gợi ý vị trí đỗ) - 1.75/3 width (7/12 cols) */}
              <div className="lg:col-span-7 flex flex-col h-full min-h-0">
                <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 flex flex-col gap-2 h-full min-h-0">
                  <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">4</div>
                      <h3 className="font-extrabold text-slate-800 text-sm">Gợi ý vị trí đỗ</h3>
                    </div>
                    <ColorfulMapIcon />
                  </div>

                  {/* Suggestions and Occupancy side-by-side split */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-y-auto pr-1">
                    
                    {/* Left Column (4/12 width): Recommendation items as interactive buttons */}
                    <div className="lg:col-span-4 flex flex-col gap-1.5 justify-center pr-2">
                      
                      {/* Car Suggestion Button */}
                      <button
                        onClick={() => setSelectedSuggestion('car')}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedSuggestion === 'car'
                            ? 'border-blue-500 bg-blue-50/30 text-blue-700 shadow-xs'
                            : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50/50 hover:border-slate-200'
                        }`}
                      >
                        <div className="text-xl shrink-0">🚘</div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] uppercase tracking-wider leading-none ${selectedSuggestion === 'car' ? 'text-blue-600 font-extrabold' : 'text-slate-400 font-bold'}`}>
                            Ô tô tiện tại
                          </p>
                          <p className="text-xs font-black mt-1 text-slate-800">B2 - Slot A12</p>
                        </div>
                      </button>

                      {/* Motorbike Suggestion Button */}
                      <button
                        onClick={() => setSelectedSuggestion('motorbike')}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedSuggestion === 'motorbike'
                            ? 'border-blue-500 bg-blue-50/30 text-blue-700 shadow-xs'
                            : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50/50 hover:border-slate-200'
                        }`}
                      >
                        <div className="text-xl shrink-0">🛵</div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] uppercase tracking-wider leading-none ${selectedSuggestion === 'motorbike' ? 'text-blue-600 font-extrabold' : 'text-slate-400 font-bold'}`}>
                            Xe máy
                          </p>
                          <p className="text-xs font-black mt-1 text-slate-800">B1 - Khu C</p>
                        </div>
                      </button>

                      {/* Truck Suggestion Button */}
                      <button
                        onClick={() => setSelectedSuggestion('truck')}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedSuggestion === 'truck'
                            ? 'border-blue-500 bg-blue-50/30 text-blue-700 shadow-xs'
                            : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50/50 hover:border-slate-200'
                        }`}
                      >
                        <div className="text-xl shrink-0">🚛</div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] uppercase tracking-wider leading-none ${selectedSuggestion === 'truck' ? 'text-blue-600 font-extrabold' : 'text-slate-400 font-bold'}`}>
                            Xe tải
                          </p>
                          <p className="text-xs font-black mt-1 text-slate-800">B3 - Truck Bay 03</p>
                        </div>
                      </button>

                    </div>

                    {/* Right Column (8/12 width): Occupancy visual list for the selected suggestion */}
                    <div className="lg:col-span-8 flex flex-col gap-1.5 justify-center border-l border-slate-100 pl-3">
                      
                      {selectedSuggestion === 'motorbike' && (
                        /* B1 Floor */
                        <div className="flex items-center justify-between gap-1.5 p-2.5 border border-slate-100 rounded-xl bg-slate-50/50 animate-fade-in">
                          <span className="text-[10px] font-extrabold text-slate-700 w-20 shrink-0">B1 - Khu C</span>
                          <div className="grid grid-rows-2 grid-cols-6 gap-0.5 flex-1 justify-center max-w-[100px]">
                            {[true, true, false, false, true, false, false, false, true, true, false, false].map((occ, idx) => (
                              <div 
                                key={idx} 
                                className={`w-3.5 h-3.5 rounded-sm border ${
                                  occ ? 'bg-slate-300 border-slate-300' : 'bg-white border-slate-200'
                                }`}
                                title={occ ? 'Đã đỗ' : 'Còn trống'}
                              ></div>
                            ))}
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end gap-0.5 min-w-[76px]">
                            <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-transparent text-[9px] font-bold px-1.5 py-0.2 rounded shadow-none flex items-center">
                              <MiniParkingIcon />
                              48%
                            </Badge>
                            <span className="text-[8px] text-slate-400 font-bold leading-none">Còn 34/64 trống</span>
                          </div>
                        </div>
                      )}

                      {selectedSuggestion === 'car' && (
                        /* B2 Floor */
                        <div className="flex items-center justify-between gap-1.5 p-2.5 border border-slate-100 rounded-xl bg-slate-50/50 animate-fade-in">
                          <span className="text-[10px] font-extrabold text-slate-700 w-20 shrink-0">B2 - Khu A</span>
                          <div className="grid grid-rows-2 grid-cols-6 gap-0.5 flex-1 justify-center max-w-[100px]">
                            {[false, false, true, true, 'suggested', false, false, false, true, false, false, true].map((state, idx) => (
                              <div 
                                key={idx} 
                                className={`w-3.5 h-3.5 rounded-sm border ${
                                  state === 'suggested' ? 'border-2 border-emerald-600 bg-white animate-pulse' :
                                  state ? 'bg-slate-300 border-slate-300' : 'bg-white border-slate-200'
                                }`}
                                title={state === 'suggested' ? 'Slot đề xuất: Slot A12' : state ? 'Đã đỗ' : 'Còn trống'}
                              ></div>
                            ))}
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end gap-0.5 min-w-[76px]">
                            <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-transparent text-[9px] font-bold px-1.5 py-0.2 rounded shadow-none flex items-center">
                              <MiniParkingIcon />
                              42%
                            </Badge>
                            <span className="text-[8px] text-slate-400 font-bold leading-none">Còn 58/138 trống</span>
                          </div>
                        </div>
                      )}

                      {selectedSuggestion === 'truck' && (
                        /* B3 Floor */
                        <div className="flex items-center justify-between gap-1.5 p-2.5 border border-slate-100 rounded-xl bg-slate-50/50 animate-fade-in">
                          <span className="text-[10px] font-extrabold text-slate-700 w-20 shrink-0">B3 - Khu B</span>
                          <div className="grid grid-rows-2 grid-cols-6 gap-0.5 flex-1 justify-center max-w-[100px]">
                            {[true, true, true, false, true, true, false, false, true, true, true, false].map((occ, idx) => (
                              <div 
                                key={idx} 
                                className={`w-3.5 h-3.5 rounded-sm border ${
                                  occ ? 'bg-slate-300 border-slate-300' : 'bg-white border-slate-200'
                                }`}
                                title={occ ? 'Đã đỗ' : 'Còn trống'}
                              ></div>
                            ))}
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end gap-0.5 min-w-[76px]">
                            <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-transparent text-[9px] font-bold px-1.5 py-0.2 rounded shadow-none flex items-center">
                              <MiniParkingIcon />
                              23%
                            </Badge>
                            <span className="text-[8px] text-slate-400 font-bold leading-none">Còn 23/96 trống</span>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Legend at bottom */}
                  <div className="flex items-center justify-center gap-3 mt-0.5 text-[9px] font-bold text-slate-400 shrink-0 border-t border-slate-50 pt-1.5">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
                      <span>Trống</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-emerald-600 bg-white rounded-sm"></span>
                      <span>Đề xuất</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-slate-300 rounded-sm"></span>
                      <span>Đã chiếm</span>
                    </div>
                  </div>

                </Card>
              </div>
            </div>

          </section>

          {/* ================= RIGHT COLUMN: BOOKING (1/4 Width) ================= */}
          <section className="lg:col-span-1 flex flex-col h-full min-h-0">
            
            {/* CARD: Thông tin booking / QR */}
            <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 flex flex-col gap-2 h-full min-h-0 overflow-hidden">
              <h3 className="font-bold text-slate-800 text-sm shrink-0">Thông tin booking / QR</h3>

              {hasBooking ? (
                <div className="flex flex-col gap-2.5 flex-1 justify-center animate-fade-in min-h-0 overflow-y-auto pr-1">
                  {/* Widget 1: Booking Status Check */}
                  <div className="p-3 border border-blue-100 rounded-lg bg-blue-50/20 shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <QrCode className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-blue-800 leading-none">QR nhận diện</h4>
                          <p className="text-[10px] font-semibold text-slate-400 mt-1">BK-250520-018</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded border-transparent shadow-none">
                        Hợp lệ
                      </Badge>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-50 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Loại vào:</span>
                      <span className="font-bold text-slate-700">Đặt chỗ trước</span>
                    </div>
                  </div>

                  {/* Widget 2: Pre-booked Vehicle Info */}
                  <div className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex flex-col gap-2 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span className="text-emerald-500">🚘</span>
                      <span>Thông tin xe đặt chỗ</span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Biển số:</span>
                        <span className="font-bold text-slate-800">30F-123.45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Loại xe:</span>
                        <span className="font-bold text-slate-800">Ô tô</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Tài xế:</span>
                        <span className="font-bold text-slate-800">Minh Khang</span>
                      </div>
                    </div>
                  </div>

                  {/* Widget 3: Booked Location */}
                  <div className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex flex-col gap-2 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="text-amber-500">📍</span>
                        <span>Vị trí đã đặt</span>
                      </div>
                      <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1 py-0.5 rounded border-transparent shadow-none">
                        Có thể vào
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Tầng/Khu:</span>
                        <span className="font-bold text-slate-800">B2 - Khu A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Slot:</span>
                        <span className="font-bold text-blue-600">Slot A12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Khung giờ:</span>
                        <span className="font-bold text-slate-800 font-mono">09:00 - 13:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 px-3 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center gap-2 flex-1">
                  <QrCode className="h-8 w-8 text-slate-300" />
                  <p className="text-sm font-bold text-slate-400">Không tìm thấy thông tin</p>
                  <p className="text-[10px] text-slate-400 max-w-[150px]">
                    (Nhập biển số 30F-123.45 để kiểm tra thông tin đặt chỗ/QR)
                  </p>
                </div>
              )}
            </Card>

          </section>

        </div>

        {/* ================= BOTTOM ROW: STEP 5 (Thao tác) - Full Screen Width ================= */}
        <div className="w-full shrink-0">
          <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-blue-600 text-white font-black text-xs shrink-0">5</span>
                <h3 className="font-black text-slate-800 text-sm">Thao tác</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <Info className="h-3.5 w-3.5 text-blue-500 stroke-[2.5]" />
                <span>Thời gian xử lý mục tiêu:</span>
                <span className="font-extrabold text-slate-700">3-5 giây / lượt xe vào</span>
              </div>
            </div>

            {/* Split layout: left 50% for first 3 buttons, right 50% for last 2 buttons */}
            <div className="flex flex-col lg:flex-row gap-2">
              {/* Left group: 3 buttons (50% width on desktop) */}
              <div className="grid grid-cols-3 gap-2 lg:w-1/2 w-full">
                <Button 
                  variant="outline"
                  onClick={handleScanPlate}
                  className="h-11 w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-black text-xs lg:text-[13px] rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Camera className="h-5.5 w-5.5 shrink-0 stroke-[2.8] text-blue-600" />
                  Quét biển số
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleScanCard}
                  className="h-11 w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-black text-xs lg:text-[13px] rounded-lg shadow-xs transition cursor-pointer"
                >
                  <CreditCard className="h-5.5 w-5.5 shrink-0 stroke-[2.8] text-blue-600" />
                  Quét thẻ
                </Button>

                <Button 
                  variant="outline"
                  onClick={handleRecheck}
                  className="h-11 w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-black text-xs lg:text-[13px] rounded-lg shadow-xs transition cursor-pointer"
                >
                  <RefreshCw className="h-5.5 w-5.5 shrink-0 stroke-[2.8] text-blue-600" />
                  Kiểm tra lại
                </Button>
              </div>

              {/* Right group: 2 buttons (50% width on desktop) */}
              <div className="grid grid-cols-2 gap-2 lg:w-1/2 w-full">
                <Button
                  onClick={handleCreateSession}
                  className={`h-11 w-full rounded-lg flex items-center justify-center gap-2.5 font-black text-xs lg:text-[13px] shadow-xs transition cursor-pointer ${
                    allChecksPassed
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border-transparent'
                  }`}
                >
                  <Plus className="h-5.5 w-5.5 shrink-0 stroke-[2.8] text-white" />
                  Tạo phiên đỗ xe
                </Button>

                <Button
                  onClick={handleOpenBarrier}
                  className="h-11 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs hover:shadow-md flex items-center justify-center gap-2.5 font-black text-xs lg:text-[13px] transition cursor-pointer border-transparent"
                >
                  <BarrierIcon className="h-6 w-6 shrink-0 text-white" />
                  Mở cổng
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}