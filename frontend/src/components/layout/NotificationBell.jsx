import React, { useState, useEffect, useRef } from "react";
import { Bell, AlertCircle, Info, Clock, CalendarDays, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationService } from "@/services/notificationService";
import { Badge } from "@/components/ui/badge";

const TYPE_ICONS = {
  MONTHLY_PASS: <CalendarDays className="size-4 text-emerald-500" />,
  PAYMENT: <ReceiptText className="size-4 text-sky-500" />,
  RESERVATION: <Clock className="size-4 text-amber-500" />,
  PARKING: <AlertCircle className="size-4 text-rose-500" />,
  SYSTEM: <Info className="size-4 text-slate-500" />,
};

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
}

export default function NotificationBell({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const effectiveUserId = userId || JSON.parse(sessionStorage.getItem("currentUser") || "{}")?.id || "staff01";
    try {
      const data = await notificationService.getNotifications(effectiveUserId);
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.isRead).length || 0);
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh mỗi 10s để nhận ngay kết quả xử lý từ Manager/Admin
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return; // Đã đọc rồi thì không gọi API
    try {
      await notificationService.markAsRead(id);
      // Cập nhật state local
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        aria-label="Thông báo"
      >
        <Bell className="size-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="font-bold text-slate-900">Thông báo</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer" onClick={() => {
                notifications.filter(n => !n.isRead).forEach(n => handleMarkAsRead(n.id, false));
              }}>
                Đánh dấu đã đọc tất cả
              </Badge>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Bell className="mb-2 size-8 text-slate-300 opacity-50" />
                <p className="text-sm font-medium">Chưa có thông báo nào</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                    className={cn(
                      "group relative flex cursor-pointer gap-4 p-4 transition-all hover:bg-slate-50",
                      !notification.isRead ? "bg-sky-50/50" : ""
                    )}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-sky-500" />
                    )}
                    
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                      {TYPE_ICONS[notification.type] || <Info className="size-4 text-slate-500" />}
                    </div>
                    
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <p className={cn(
                          "text-sm",
                          !notification.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                        )}>
                          {notification.title}
                        </p>
                      </div>
                      <p className={cn(
                        "mt-1 text-sm line-clamp-2",
                        !notification.isRead ? "text-slate-600" : "text-slate-500"
                      )}>
                        {notification.content}
                      </p>
                      <span className="mt-2 text-xs font-medium text-slate-400">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
