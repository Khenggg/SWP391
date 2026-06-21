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
    <div className="h-screen bg-slate-50 text-slate-800 font-sans p-4 flex flex-col overflow-hidden">
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
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-3 mb-3 border-b border-slate-200 shrink-0">
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

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        
        {/* ================= LEFT COLUMN: STEPS 1, 2, 3, 4, 5 (3/4 Width) ================= */}
        <section className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
          
          {/* ROW 1: Steps 1 & 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-[5] min-h-0">
            {/* Step 1 (Camera nhận diện) - 2/3 width */}
            <div className="lg:col-span-2 flex flex-col h-full min-h-0">
              <Card className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col p-0 gap-0 h-full min-h-0">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 w-full shrink-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">1</span>
                    <h3 className="font-bold text-slate-800 text-xs">Camera nhận diện</h3>
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

            {/* Step 2 (Thông tin xe vào) - 1/3 width */}
            <div className="lg:col-span-1 flex flex-col h-full min-h-0">
              <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3 h-full min-h-0">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">2</span>
                  <h3 className="font-bold text-slate-800 text-xs">Thông tin xe vào</h3>
                </div>

                {/* Form */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                  {/* Field: License Plate */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-slate-500">Biển số <span className="text-rose-500">*</span></label>
                    <Input 
                      type="text" 
                      value={plateNumber} 
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="h-8.5 px-3 rounded-lg font-bold text-xs focus-visible:border-blue-500 focus-visible:ring-blue-100 text-slate-800"
                      placeholder="30F-123.45"
                    />
                  </div>

                  {/* Field: Card Code */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-slate-500">Mã thẻ</label>
                    <div className="relative">
                      <Input 
                        type="text" 
                        value={cardCode} 
                        onChange={(e) => setCardCode(e.target.value)}
                        className="h-8.5 px-3 pr-8 rounded-lg font-mono font-bold text-xs focus-visible:border-blue-500 focus-visible:ring-blue-100 text-slate-800"
                        placeholder="TH-00112345"
                      />
                      {isCardValid && (
                        <CheckCircle className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Field: Vehicle Type */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Loại xe <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-4 gap-0.5 p-0.5 bg-slate-100 rounded-lg">
                      {['motorbike', 'car', 'truck', 'bicycle'].map((type) => {
                        const label = type === 'motorbike' ? 'Xe máy' : type === 'car' ? 'Ô tô' : type === 'truck' ? 'Xe tải' : 'Xe đạp';
                        return (
                          <button
                            key={type}
                            onClick={() => setVehicleType(type)}
                            className={`py-1 text-[9px] font-bold rounded transition cursor-pointer ${
                              vehicleType === type
                                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field: Driver Group */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Nhóm tài xế <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-2 gap-0.5 p-0.5 bg-slate-100 rounded-lg">
                      {['resident', 'visitor'].map((grp) => {
                        const label = grp === 'resident' ? 'Cư dân' : 'Khách';
                        return (
                          <button
                            key={grp}
                            onClick={() => setDriverGroup(grp)}
                            className={`py-1 text-[9px] font-bold rounded transition cursor-pointer ${
                              driverGroup === grp
                                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                                : 'text-slate-500 hover:text-slate-800'
                              }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field: Gate */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-slate-500">Cổng vào <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select 
                        value={gate}
                        onChange={(e) => setGate(e.target.value)}
                        className="w-full h-8.5 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-xs focus:outline-none focus:border-blue-500 appearance-none bg-white text-slate-800 cursor-pointer"
                      >
                        <option value="A1">Cổng A1</option>
                        <option value="A2">Cổng A2</option>
                        <option value="B1">Cổng B1</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Field: Time In */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-slate-500">Thời gian vào</label>
                    <div className="relative">
                      <Input 
                        type="text" 
                        value={entryTime}
                        onChange={(e) => setEntryTime(e.target.value)}
                        className="h-8.5 px-3 pr-8 rounded-lg font-bold text-xs focus-visible:border-blue-500 focus-visible:ring-blue-100 text-slate-500 font-medium"
                      />
                      <Calendar className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Thumbnail Attachments */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {/* Vehicle photo */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400">Ảnh xe</span>
                      <div className="bg-slate-100 rounded-lg overflow-hidden aspect-[4/3] relative border border-slate-150">
                        <img 
                          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80" 
                          alt="Car attachment" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {/* Plate Crop Photo */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400">Ảnh biển số</span>
                      <div className="bg-slate-900 rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center border border-slate-800 p-1.5">
                        <div className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white font-mono font-black tracking-wider text-[10px] shadow-inner">
                          30F-123.45
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* ROW 2: Steps 3 & 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-[4] min-h-0">
            {/* Step 3 (Kiểm tra hệ thống) - 1/3 width */}
            <div className="lg:col-span-1 flex flex-col h-full min-h-0">
              <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3 h-full min-h-0">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">3</span>
                  <h3 className="font-bold text-slate-800 text-xs">Kiểm tra hệ thống</h3>
                </div>

                {/* Check Grid List */}
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 justify-center">
                  {/* Check 1 */}
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Thẻ khả dụng</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-[11px] font-bold ${isCardValid ? 'text-slate-700' : 'text-rose-600'}`}>
                        {isCardValid ? 'Hợp lệ' : 'Lỗi/Khóa'}
                      </span>
                      {isCardValid ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Check 2 */}
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Trùng phiên hoạt động</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-[11px] font-bold ${isNoDuplicateSession ? 'text-slate-700' : 'text-rose-600'}`}>
                        {isNoDuplicateSession ? 'Không trùng' : 'Bị trùng'}
                      </span>
                      {isNoDuplicateSession ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Check 3 */}
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Mẫu biển số xe</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-[11px] font-bold ${isPlateValid ? 'text-slate-700' : 'text-rose-600'}`}>
                        {isPlateValid ? 'Chuẩn quy chuẩn' : 'Không đạt'}
                      </span>
                      {isPlateValid ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Check 4 */}
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Phân loại xe</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-[11px] font-bold ${isVehicleTypeValid ? 'text-slate-700' : 'text-rose-600'}`}>
                        {isVehicleTypeValid ? 'Khớp loại' : 'Không khớp'}
                      </span>
                      {isVehicleTypeValid ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 4 (Gợi ý vị trí đỗ) - 2/3 width */}
            <div className="lg:col-span-2 flex flex-col h-full min-h-0">
              <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3 h-full min-h-0">
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">4</span>
                    <h3 className="font-bold text-slate-800 text-xs">Gợi ý vị trí đỗ</h3>
                  </div>
                  <MapPin className="h-4 w-4 text-blue-600 cursor-pointer" />
                </div>

                {/* Suggestions and Occupancy wrapper */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                  {/* Suggestions list */}
                  <div className="flex flex-col gap-1.5">
                    {/* Sug 1 */}
                    <div className="flex items-center justify-between p-2 bg-blue-50/50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-blue-500 text-white flex items-center justify-center text-xs">
                          🚘
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Ô tô đề xuất</p>
                          <p className="text-xs font-extrabold text-blue-700 mt-0.5">B2 - Slot A12</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border-transparent shadow-none">
                        Tốt nhất
                      </Badge>
                    </div>

                    {/* Sug 2 */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center text-xs">
                        🛵
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Xe máy</p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">B1 - Khu C</p>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy visual grid panel */}
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-2.5">
                    {/* Floor 1 */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-bold text-slate-700">B1 - Khu C (48%)</span>
                        <span className="text-slate-400 font-medium">Còn 34/64 trống</span>
                      </div>
                      {/* Visual Cells Grid */}
                      <div className="grid grid-cols-8 gap-1">
                        {[true, true, false, false, true, false, false, false].map((occ, idx) => (
                          <div 
                            key={idx} 
                            className={`h-4 rounded border ${
                              occ ? 'bg-slate-300 border-slate-300' : 'bg-white border-slate-200 hover:border-blue-400 cursor-pointer'
                            }`}
                            title={occ ? 'Đã đỗ' : 'Còn trống'}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Floor 2 */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-bold text-slate-700">B2 - Khu A (42%)</span>
                        <span className="text-slate-400 font-medium">Còn 58/138 trống</span>
                      </div>
                      {/* Visual Cells Grid with dynamic suggestion slot */}
                      <div className="grid grid-cols-8 gap-1">
                        {[false, false, true, true, 'suggested', false, false, false].map((state, idx) => (
                          <div 
                            key={idx} 
                            className={`h-4 rounded border ${
                              state === 'suggested' ? 'bg-blue-50 border-emerald-500 border-2 ring-2 ring-emerald-100 animate-pulse' :
                              state ? 'bg-slate-300 border-slate-300' : 'bg-white border-slate-200 hover:border-blue-400 cursor-pointer'
                            }`}
                            title={state === 'suggested' ? 'Ví trí đề xuất: Slot A12' : state ? 'Đã đỗ' : 'Còn trống'}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-3 mt-1 text-[9px] font-bold text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded border border-slate-300 bg-white"></span>
                        <span>Trống</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded border border-emerald-500 bg-blue-50"></span>
                        <span>Gợi ý</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-slate-300"></span>
                        <span>Đã đỗ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* ROW 3: Step 5 (Thao tác) - Full width */}
          <div className="w-full shrink-0">
            <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">5</span>
                <h3 className="font-bold text-slate-800 text-xs">Thao tác</h3>
              </div>

              {/* Quick Actions Buttons Row */}
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline"
                  onClick={handleScanPlate}
                  className="h-10 flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Camera className="h-4 w-4 shrink-0" />
                  Quét biển số
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleScanCard}
                  className="h-10 flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
                >
                  <CreditCard className="h-4 w-4 shrink-0" />
                  Quét thẻ
                </Button>

                <Button 
                  variant="outline"
                  onClick={handleRecheck}
                  className="h-10 flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  Kiểm tra lại
                </Button>
              </div>

              {/* Large Buttons Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Blue CTA */}
                <Button
                  onClick={handleCreateSession}
                  className={`h-12.5 rounded-lg flex items-center justify-center gap-3 font-bold text-xs shadow-md transition cursor-pointer ${
                    allChecksPassed
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border-transparent'
                  }`}
                >
                  <Plus className="h-4.5 w-4.5 shrink-0" />
                  <div className="text-left">
                    <p className="font-extrabold leading-tight text-xs">Tạo parking session</p>
                    <p className="text-[9px] opacity-80 font-medium">Tạo phiên đỗ xe mới</p>
                  </div>
                </Button>

                {/* Green CTA */}
                <Button
                  onClick={handleOpenBarrier}
                  className="h-12.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-3 font-bold text-xs transition cursor-pointer border-transparent"
                >
                  <LogIn className="h-4.5 w-4.5 rotate-270 shrink-0" />
                  <div className="text-left">
                    <p className="font-extrabold leading-tight text-xs">Mở barrier</p>
                    <p className="text-[9px] opacity-80 font-medium">Mở cổng cho xe vào</p>
                  </div>
                </Button>
              </div>

              {/* Target Footer */}
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-2 shrink-0">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                <span>Thời gian xử lý mục tiêu:</span>
                <span className="font-bold text-slate-700">3-5 giây / lượt xe vào</span>
              </div>
            </Card>
          </div>

        </section>

        {/* ================= RIGHT COLUMN: BOOKING & RECENT ENTRIES (1/4 Width) ================= */}
        <section className="lg:col-span-1 flex flex-col gap-4 h-full min-h-0 overflow-y-auto pr-1">
          
          {/* CARD: Thông tin booking / QR */}
          <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3">
            <h3 className="font-bold text-slate-800 text-xs">Thông tin booking / QR</h3>

            {hasBooking ? (
              <div className="flex flex-col gap-3 animate-fade-in">
                {/* Widget 1: Booking Status Check */}
                <div className="p-3 border border-blue-100 rounded-lg bg-blue-50/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <QrCode className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-blue-800 leading-none">QR nhận diện</h4>
                        <p className="text-[9px] font-semibold text-slate-400 mt-1">BK-250520-018</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border-transparent shadow-none">
                      Hợp lệ
                    </Badge>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Loại vào:</span>
                    <span className="font-bold text-slate-700">Đặt chỗ trước</span>
                  </div>
                </div>

                {/* Widget 2: Pre-booked Vehicle Info */}
                <div className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                    <span className="text-emerald-500">🚘</span>
                    <span>Thông tin xe đặt chỗ</span>
                  </div>
                  <div className="flex flex-col gap-1 text-[11px]">
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
                <div className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <span className="text-amber-500">📍</span>
                      <span>Vị trí đã đặt</span>
                    </div>
                    <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[8.5px] font-extrabold px-1 py-0.5 rounded border-transparent shadow-none">
                      Có thể vào
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-[11px]">
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
              <div className="py-8 px-3 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center gap-1.5">
                <QrCode className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-400">Không tìm thấy thông tin</p>
                <p className="text-[9px] text-slate-400 max-w-[150px]">
                  (Nhập biển số 30F-123.45 để kiểm tra thông tin đặt chỗ/QR)
                </p>
              </div>
            )}
          </Card>

          {/* CARD: Lượt xe vào gần đây */}
          <Card className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs">Lượt xe vào gần đây</h3>
              <a href="#/recent" className="text-xs font-bold text-blue-600 hover:underline">Tất cả</a>
            </div>

            {/* Entries Table */}
            <div className="max-h-[180px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="h-7 font-bold text-slate-400 text-[10px] px-0">Biển số</TableHead>
                    <TableHead className="h-7 font-bold text-slate-400 text-[10px]">Loại</TableHead>
                    <TableHead className="h-7 font-bold text-slate-400 text-[10px] text-right pr-0">Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEntries.map((entry, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/50 border-slate-50">
                      <TableCell className="py-2 font-extrabold text-slate-800 flex items-center gap-1 px-0 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        {entry.plate}
                      </TableCell>
                      <TableCell className="py-2 font-semibold text-slate-600 text-[11px]">
                        {entry.type === 'car' ? '🚘' : entry.type === 'motorbike' ? '🛵' : '🚛'}
                      </TableCell>
                      <TableCell className="py-2 text-right font-medium text-slate-400 pr-0 text-[10px]">{entry.time.split(' ')[0]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer sync indicator */}
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 border-t border-slate-50 pt-2 shrink-0">
              <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
              <span>Dữ liệu cập nhật mỗi 10 giây</span>
            </div>
          </Card>

        </section>

      </main>
    </div>
  );
}
