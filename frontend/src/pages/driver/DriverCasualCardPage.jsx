import React, { useEffect, useState } from "react";
import {
  QrCode,
  CreditCard,
  Clock,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Receipt,
  CheckCircle2,
  RefreshCw,
  Car,
  Camera,
  Search,
} from "lucide-react";
import { driverService } from "@/services/driverService";
import { formatDateTime, formatVND } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import LicensePlate from "@/components/ui/license-plate";
import PayOSCasualPaymentModal from "@/components/driver/casual/PayOSCasualPaymentModal";
import { toast } from "sonner";

export default function DriverCasualCardPage() {
  const [claimedSessions, setClaimedSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [selectedSessionForPayment, setSelectedSessionForPayment] = useState(null);
  const [securityError, setSecurityError] = useState("");

  const fetchMySessions = async () => {
    setIsLoading(true);
    try {
      const data = await driverService.getMyClaimedSessions();
      setClaimedSessions(data || []);
      setSecurityError("");
    } catch (err) {
      console.error("Load claimed sessions failed:", err);
      toast.error(err.message || "Không thể tải danh sách thẻ vãng lai đã liên kết.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySessions();

    const handleFocus = () => {
      fetchMySessions();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleClaimCard = async (e, autoOpenPayment = true) => {
    e?.preventDefault();
    if (!inputCode.trim()) {
      toast.error("Vui lòng nhập mã thẻ hoặc mã QR.");
      return;
    }

    setIsSubmitting(true);
    setSecurityError("");
    try {
      const result = await driverService.claimCasualCard(inputCode.trim());
      toast.success("Liên kết thẻ đỗ xe vãng lai thành công!");
      setInputCode("");
      await fetchMySessions();

      if (autoOpenPayment && result && result.paymentStatus !== "PAID") {
        setSelectedSessionForPayment(result);
      }
    } catch (err) {
      console.error("Claim casual card error:", err);
      const msg = err.message || "Liên kết thẻ xe thất bại.";
      if (
        msg.toLowerCase().includes("liên kết") ||
        msg.toLowerCase().includes("tài khoản khác") ||
        msg.includes("SESSION_ALREADY_CLAIMED")
      ) {
        setSecurityError(
          "CẢNH BÁO BẢO MẬT: Thẻ xe này đã được liên kết bởi một tài khoản khác! Dù bất kỳ ai nhặt được hay quét mã QR cũng không thể xem thông tin hoặc can thiệp."
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-2 sm:p-4">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Quét & Liên Kết Thẻ Xe Vãng Lai
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Liên kết thẻ xe vật lý với tài khoản để theo dõi vị trí, tính phí thực tế và thanh toán online PayOS trước khi ra cổng.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMySessions}
          disabled={isLoading}
          className="w-fit font-bold flex items-center gap-2"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Claim Form Card */}
      <Card className="border-indigo-500/20 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900 shadow-xl text-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-black text-indigo-300">
            <QrCode className="size-5 text-indigo-400" />
            Nhập hoặc Quét mã QR trên thẻ
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 font-medium">
            Mỗi thẻ xe vật lý đều có mã in hoặc QR tương ứng. Sau khi liên kết, duy nhất bạn mới có quyền xem thông tin và thanh toán.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleClaimCard(e, true)} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Ví dụ: C006, CARD-001 hoặc mã QR token..."
                className="bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-500 font-mono text-sm pl-10 h-11"
              />
              <Search className="absolute left-3 top-3 size-5 text-slate-500" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || !inputCode.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-11 px-5 shadow-lg shadow-emerald-600/20 uppercase tracking-wider text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 size-4" />
                    Liên kết & Thanh toán ngay
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={(e) => handleClaimCard(e, false)}
                disabled={isSubmitting || !inputCode.trim()}
                variant="outline"
                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 font-bold h-11 px-4 text-xs"
              >
                <ShieldCheck className="mr-1.5 size-4 text-indigo-400" />
                Chỉ liên kết
              </Button>
            </div>
          </form>

          {/* Security Alert display if scanned card is owned by someone else */}
          {securityError && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-950/50 p-4 text-rose-200">
              <ShieldAlert className="size-6 shrink-0 text-rose-400 animate-bounce" />
              <div className="text-xs font-semibold leading-relaxed">
                <span className="font-black block text-rose-300 text-sm mb-0.5">Truy cập bị từ chối!</span>
                {securityError}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claimed Sessions Section */}
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <CreditCard className="size-5 text-indigo-600" />
            Thẻ Xe Đang Trong Bãi ({claimedSessions.length})
          </h2>
          <span className="text-xs font-bold text-muted-foreground">
            Bảo mật mã hóa liên kết tài khoản
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="mx-auto size-8 text-indigo-600 animate-spin" />
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              Đang tải danh sách thẻ vãng lai...
            </p>
          </div>
        ) : claimedSessions.length === 0 ? (
          <Card>
            <CardContent className="p-10">
              <EmptyState
                icon="QR"
                title="Chưa có thẻ vãng lai nào được liên kết"
                description="Nhập mã thẻ xe vãng lai ở ô phía trên để bắt đầu theo dõi vị trí và thanh toán online."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {claimedSessions.map((session) => (
              <Card
                key={session.sessionId}
                className="overflow-hidden border border-slate-200 shadow-md transition-all hover:shadow-lg dark:border-slate-800"
              >
                {/* Header */}
                <div className="bg-slate-900 text-slate-100 p-4 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                      <Car className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-indigo-300">
                          {session.cardCode}
                        </span>
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 font-bold">
                          <ShieldCheck className="size-3 mr-1" /> Đã bảo vệ
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        Mã lượt: {session.sessionCode}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={session.paymentStatus === "PAID" ? "default" : "secondary"}
                    className={
                      session.paymentStatus === "PAID"
                        ? "bg-emerald-500 text-white font-extrabold"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold"
                    }
                  >
                    {session.paymentStatus === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
                  </Badge>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* License Plate & Image */}
                  <div className="flex items-start justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider mb-1">
                        Biển số xe / Nhận diện
                      </span>
                      {session.plateNumber ? (
                        <LicensePlate plate={session.plateNumber} size="md" />
                      ) : (
                        <div className="text-sm font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/50">
                          Không biển số ({session.vehicleDescription || "Xe vãng lai"})
                        </div>
                      )}
                      {session.vehicleTypeName && (
                        <span className="text-xs font-semibold text-muted-foreground mt-1.5 block">
                          Loại xe: <strong>{session.vehicleTypeName}</strong>
                        </span>
                      )}
                    </div>
                    {session.primaryImageUrl && (
                      <img
                        src={session.primaryImageUrl}
                        alt="Xe vào bãi"
                        className="w-20 h-14 object-cover rounded-lg border shadow-sm shrink-0"
                      />
                    )}
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border bg-background">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                        <MapPin className="size-3.5 text-indigo-500" />
                        Vị trí đỗ xe
                      </div>
                      <span className="font-extrabold text-foreground text-sm block">
                        {session.floorCode || "Tầng --"} / {session.areaCode || "Khu --"}
                      </span>
                      {session.slotCode && (
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black">
                          Ô đỗ: {session.slotCode}
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl border bg-background">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                        <Clock className="size-3.5 text-indigo-500" />
                        Thời gian vào bãi
                      </div>
                      <span className="font-bold text-foreground text-xs block">
                        {formatDateTime(session.entryTime)}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Thời lượng: <strong>{session.durationHours}h</strong>
                      </span>
                    </div>
                  </div>

                  {/* Fee Preview & Payment Action */}
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Receipt className="size-4 text-indigo-600" />
                        Phí gửi xe tạm tính:
                      </div>
                      <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                        {formatVND(session.feeAmount)}
                      </span>
                    </div>

                    {session.paymentStatus === "PAID" ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="size-4 shrink-0" />
                        Đã thanh toán online. Bạn có thể cho xe ra bãi trực tiếp qua cổng ra.
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedSessionForPayment(session)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/20 h-10 text-xs uppercase tracking-wider"
                      >
                        Thanh toán online ngay (PayOS)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* PayOS Payment Modal */}
      <PayOSCasualPaymentModal
        open={Boolean(selectedSessionForPayment)}
        onClose={() => setSelectedSessionForPayment(null)}
        session={selectedSessionForPayment}
        onPaymentSuccess={() => {
          setSelectedSessionForPayment(null);
          toast.success("Thanh toán hoàn tất! Đang tự động làm mới trang...");
          setTimeout(() => {
            window.location.reload();
          }, 800);
        }}
      />
    </div>
  );
}
