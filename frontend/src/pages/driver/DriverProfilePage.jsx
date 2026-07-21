import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { driverService } from "../../services/driverService";
import { vehicleService } from "../../services/vehicleService";
import { reservationService } from "../../services/reservationService";

import ProfileCard from "../../components/driver/profile/ProfileCard";
import StatsCard from "../../components/driver/profile/StatsCard";
import AccountTypeBlock from "../../components/driver/profile/AccountTypeBlock";
import VehiclesList from "../../components/driver/profile/VehiclesList";
import HistoryList from "../../components/driver/profile/HistoryList";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    <div className="p-6 space-y-4">
      <div className="h-4 w-32 bg-slate-200 rounded" />
      <div className="h-3 w-4/5 bg-slate-100 rounded" />
      <div className="h-3 w-2/3 bg-slate-100 rounded" />
      <div className="grid grid-cols-3 gap-3 pt-3">
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    </div>
  </div>
);

const ProfilePageSkeleton = () => (
  <div className="max-w-6xl mx-auto space-y-6 pb-12">
    <div className="mb-8 animate-pulse">
      <div className="h-7 w-48 bg-slate-200 rounded mb-3" />
      <div className="h-4 w-96 max-w-full bg-slate-100 rounded" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonBlock className="min-h-[210px]" />
      <SkeletonBlock className="min-h-[210px]" />
    </div>
    <SkeletonBlock className="min-h-[120px]" />
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <SkeletonBlock className="xl:col-span-4 min-h-[260px]" />
      <SkeletonBlock className="xl:col-span-8 min-h-[260px]" />
    </div>
  </div>
);

export default function DriverProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const [profileResult, vehiclesResult, historyResult] = await Promise.allSettled([
          driverService.getDriverProfile(),
          vehicleService.getVehicles().then(res => res.items),
          reservationService.getHistory(0, 5)
        ]);

        if (cancelled) return;

        if (profileResult.status !== "fulfilled" || !profileResult.value) {
          throw profileResult.status === "rejected"
            ? profileResult.reason
            : new Error("Khong the tai thong tin ho so");
        }

        const profileData = profileResult.value;
        const vehiclesData =
          vehiclesResult.status === "fulfilled" && Array.isArray(vehiclesResult.value)
            ? vehiclesResult.value
            : [];
        const historyData =
          historyResult.status === "fulfilled" && Array.isArray(historyResult.value)
            ? historyResult.value
            : [];

        const derivedDriverType =
          profileData?.driverType ||
          (vehiclesData.length > 0 ? "RESIDENT" : "VISITOR");

        setProfile({
          ...profileData,
          driverType: derivedDriverType
        });
        setVehicles(vehiclesData);
        setHistory(historyData);
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading driver profile:", err);
          setProfile(null);
          setErrorMessage(err.message || "Khong the tai thong tin ho so");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="bg-white border border-rose-100 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Khong the tai thong tin ho so</h2>
          <p className="text-sm text-slate-500 font-medium">{errorMessage || "Vui long thu lai sau."}</p>
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-black text-slate-900 mb-1">Ho so cua toi</h1>
        <p className="text-slate-500 text-sm">Quan ly thong tin tai khoan, phuong tien va lich su booking cua ban</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCard profile={profile} formatDate={formatDate} />
        <StatsCard
          vehiclesCount={vehicles.length}
          historyCount={history.length}
          latestHistory={latestHistory}
          formatDate={formatDate}
        />
      </div>

      <AccountTypeBlock isResident={isResident} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-4">
          <VehiclesList vehicles={vehicles} />
        </div>
        <div className="xl:col-span-8 space-y-4">
          <HistoryList history={history} formatDate={formatDate} formatDateTime={formatDateTime} />
        </div>
      </div>
    </div>
  );
}
