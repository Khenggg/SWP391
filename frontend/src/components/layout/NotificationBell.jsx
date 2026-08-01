import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  Info,
  Clock,
  CalendarDays,
  ReceiptText,
  TrendingUp,
  CheckCheck,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationService } from "@/services/notificationService";

// =================================================================
// CONSTANTS — aligned with backend enums
// NotificationType: MONTHLY_PASS | PAYMENT | RESERVATION | PRICE_CHANGE | SYSTEM
// NotificationPriority: LOW | NORMAL | HIGH
// =================================================================
const TYPE_CONFIG = {
  MONTHLY_PASS: {
    icon: <CalendarDays className="size-4" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Vé tháng",
  },
  PAYMENT: {
    icon: <ReceiptText className="size-4" />,
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    label: "Thanh toán",
  },
  RESERVATION: {
    icon: <Clock className="size-4" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Đặt chỗ",
  },
  PRICE_CHANGE: {
    icon: <TrendingUp className="size-4" />,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    label: "Thay đổi giá",
  },
  SYSTEM: {
    icon: <Info className="size-4" />,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: "Hệ thống",
  },
};

const PRIORITY_BADGE = {
  HIGH: "bg-rose-100 text-rose-700 border-rose-200",
  NORMAL: null,
  LOW: "bg-slate-100 text-slate-500 border-slate-200",
};

const PRIORITY_LABEL = {
  HIGH: "Khẩn",
  LOW: "Thấp",
};

// =================================================================
// HELPERS
// =================================================================
function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const diffInSeconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
}

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.SYSTEM;
}

// =================================================================
// COMPONENT
// =================================================================
export default function NotificationBell({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Resolve userId từ prop hoặc sessionStorage
  const effectiveUserId = userId || (() => {
    try {
      return JSON.parse(sessionStorage.getItem("currentUser") || "{}")?.id;
    } catch {
      return null;
    }
  })();

  const fetchNotifications = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(effectiveUserId);
      
      // Load read notifications from localStorage
      const readStorageKey = `read_notifications_${effectiveUserId}`;
      let readIds = [];
      try {
        readIds = JSON.parse(localStorage.getItem(readStorageKey) || "[]");
      } catch (e) {
        console.warn("[NotificationBell] Error reading from localStorage:", e);
      }

      // Merge API isRead and localStorage read status
      const mapped = data.map(n => {
        const isLocallyRead = readIds.includes(n.id);
        return {
          ...n,
          isRead: n.isRead || isLocallyRead
        };
      });
      setNotifications(mapped);
      setUnreadCount(mapped.filter((n) => !n.isRead).length);
    } catch (err) {
      console.warn("[NotificationBell] Lấy thông báo thất bại:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  // Fetch ngay khi mount + polling mỗi 15 giây
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Optimistic mark-as-read; nếu BE chưa có PATCH endpoint thì chỉ cập nhật UI
  const handleMarkAsRead = useCallback(async (id, isRead) => {
    if (isRead) return;
    
    // Save to localStorage
    const readStorageKey = `read_notifications_${effectiveUserId}`;
    try {
      const readIds = JSON.parse(localStorage.getItem(readStorageKey) || "[]");
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem(readStorageKey, JSON.stringify(readIds));
      }
    } catch (e) {
      console.warn("[NotificationBell] Error saving to localStorage:", e);
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await notificationService.markAsRead(id); // graceful fail trong service
  }, [effectiveUserId]);

  const handleMarkAllRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Save to localStorage
    const readStorageKey = `read_notifications_${effectiveUserId}`;
    try {
      const readIds = JSON.parse(localStorage.getItem(readStorageKey) || "[]");
      unreadIds.forEach(id => {
        if (!readIds.includes(id)) {
          readIds.push(id);
        }
      });
      localStorage.setItem(readStorageKey, JSON.stringify(readIds));
    } catch (e) {
      console.warn("[NotificationBell] Error saving all to localStorage:", e);
    }

    setNotifications((prev) =>
      prev.map((n) => unreadIds.includes(n.id) ? { ...n, isRead: true } : n)
    );
    setUnreadCount(0);

    // Call API for each in parallel (silently, without awaiting each sequentially)
    unreadIds.forEach(id => {
      notificationService.markAsRead(id).catch(() => {});
    });
  }, [notifications, effectiveUserId]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ─── Bell Button ─── */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1"
        aria-label="Thông báo"
      >
        <Bell className={cn("size-5 transition-colors", unreadCount > 0 ? "text-slate-800" : "text-slate-500")} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ─── Dropdown Panel ─── */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[22rem] sm:w-[26rem] rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden"
          style={{ animation: "notiSlideIn 0.18s ease" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-slate-600" />
              <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
              >
                <CheckCheck className="size-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[65vh] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin mb-2" />
                <span className="text-xs font-medium">Đang tải...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <BellOff className="size-10 mb-3 opacity-30" />
                <p className="text-sm font-semibold text-slate-500">Chưa có thông báo nào</p>
                <p className="text-xs text-slate-400 mt-1">Các cập nhật sẽ hiển thị tại đây</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((n) => {
                  const typeConf = getTypeConfig(n.type);
                  const priorityBadge = PRIORITY_BADGE[n.priority];
                  const priorityLabel = PRIORITY_LABEL[n.priority];
                  return (
                    <li
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.isRead)}
                      className={cn(
                        "group relative flex cursor-pointer gap-3 px-4 py-3.5 transition-all hover:bg-slate-50/80",
                        !n.isRead ? "bg-blue-50/40" : ""
                      )}
                    >
                      {/* Unread dot */}
                      {!n.isRead && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-blue-500" />
                      )}
                      {/* Type icon */}
                      <div
                        className={cn(
                          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border",
                          typeConf.bg, typeConf.border, typeConf.color
                        )}
                      >
                        {typeConf.icon}
                      </div>
                      {/* Content */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn(
                            "text-sm leading-snug truncate",
                            !n.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-600"
                          )}>
                            {n.title}
                          </p>
                          {priorityBadge && priorityLabel && (
                            <span className={cn(
                              "shrink-0 text-[9px] font-bold border rounded px-1.5 py-0.5 uppercase tracking-wide",
                              priorityBadge
                            )}>
                              {priorityLabel}
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          "text-xs line-clamp-2 leading-relaxed",
                          !n.isRead ? "text-slate-600" : "text-slate-400"
                        )}>
                          {n.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", typeConf.bg, typeConf.color)}>
                            {typeConf.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 text-center">
              <span className="text-[11px] text-slate-400 font-medium">
                {notifications.length} thông báo • {unreadCount} chưa đọc
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes notiSlideIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
