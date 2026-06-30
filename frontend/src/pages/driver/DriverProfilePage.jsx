import React, { useState, useEffect } from "react";
import { driverService } from "../../services/driverService";
import { vehicleService } from "../../services/vehicleService";
import { reservationService } from "../../services/reservationService";

import ProfileCard from "../../components/driver/profile/ProfileCard";
import StatsCard from "../../components/driver/profile/StatsCard";
import AccountTypeBlock from "../../components/driver/profile/AccountTypeBlock";
import VehiclesList from "../../components/driver/profile/VehiclesList";
import HistoryList from "../../components/driver/profile/HistoryList";

export default function DriverProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, vehiclesData, historyData] = await Promise.all([
          driverService.getDriverProfile(),
          vehicleService.getVehiclesByOwner(),
          reservationService.getHistory(0, 5) // Fetch 5 recent history
        ]);
        
        setProfile(profileData);
        setVehicles(vehiclesData);
        setHistory(historyData);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500 font-medium">Đang tải thông tin hồ sơ...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center items-center h-64 text-red-500 font-bold">Không thể tải thông tin hồ sơ</div>;
  }

  const isResident = profile.driverType === "RESIDENT";
  const latestHistory = history.length > 0 ? history[0] : null;

  const formatDate = (isoString) => {
    if (!isoString) return "--/--/----";
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };
  
  const formatDateTime = (isoString) => {
    if (!isoString) return "--:--";
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 mb-1">Hồ sơ của tôi</h1>
        <p className="text-slate-500 text-sm">Quản lý thông tin tài khoản, phương tiện và lịch sử đỗ xe của bạn</p>
      </div>

      {/* Grid 2 Card: Profile & Tổng quan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCard 
          profile={profile} 
          formatDate={formatDate} 
        />
        <StatsCard 
          vehiclesCount={vehicles.length} 
          historyCount={history.length} 
          latestHistory={latestHistory}
          formatDate={formatDate}
        />
      </div>

      {/* Block Loại tài khoản */}
      <AccountTypeBlock isResident={isResident} />

      {/* Grid: Vehicles & History */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-4">
          <VehiclesList vehicles={vehicles} />
        </div>
        <div className="xl:col-span-8 space-y-4">
          <HistoryList 
            history={history} 
            formatDate={formatDate} 
            formatDateTime={formatDateTime} 
          />
        </div>
      </div>
    </div>
  );
}
