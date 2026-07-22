import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, QrCode, ShieldAlert, CheckCircle2 } from "lucide-react";

function formatReservationHeadline(status) {
  return status === "VALID" ? "Booking hợp lệ" : `Booking ${status || "không hợp lệ"}`;
}

export default function EntryVerificationPanel({
  entryMode,
  cardCheck,
  reservationCheck,
  onSelectBookingMode,
  isMonthlyPlateMismatch,
  detectedPlate,
}) {
  return (
    <Card className="flex flex-col border-slate-200 bg-white shadow-sm h-full overflow-hidden">
      <CardHeader className="border-b border-slate-100 py-2.5 px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
            3
          </div>
          <CardTitle className="text-sm font-bold">Xác minh xe vào</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-3 flex flex-col items-center">
        <div className="flex w-full rounded-lg bg-slate-100 p-1 mb-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectBookingMode("CASUAL")}
            className={`flex-1 rounded-md py-1 text-center text-xs font-semibold transition-all ${
              entryMode !== "RESERVATION"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-500"
            }`}
          >
            Không Booking
          </button>
          <button
            type="button"
            onClick={() => onSelectBookingMode("RESERVATION")}
            className={`flex-1 rounded-md py-1 text-center text-xs font-semibold transition-all ${
              entryMode === "RESERVATION"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-500"
            }`}
          >
            Có Booking
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full gap-2 text-center">
          {entryMode === "CASUAL" && !cardCheck && (
            <>
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center border-4 border-slate-100">
                <CreditCard className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Khách vãng lai</h3>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-tight">
                  Xe vào không booking. Vui lòng quét thẻ hoặc nhập thông tin.
                </p>
              </div>
            </>
          )}

          {entryMode === "MONTHLY" && !cardCheck && (
            <>
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center border-4 border-slate-100">
                <CreditCard className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Vé tháng / Cư dân</h3>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-tight">
                  Vui lòng quét thẻ để hệ thống kiểm tra thông tin thuê bao.
                </p>
              </div>
            </>
          )}

          {entryMode === "RESERVATION" && !reservationCheck && (
            <>
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center border-4 border-slate-100">
                <QrCode className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Khách có Booking</h3>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-tight">
                  Vui lòng kiểm tra mã booking trước khi cho xe vào.
                </p>
              </div>
            </>
          )}

          {cardCheck && (
            <div className="w-full flex flex-col gap-2">
              {isMonthlyPlateMismatch ? (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center border-4 border-red-100 animate-pulse">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-sm font-bold text-red-600 mt-1">
                    Lệch biển số vé tháng!
                  </h3>
                  <p className="text-[11px] text-red-500 font-medium mt-0.5">
                    Không khớp biển số đăng ký
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-700 mt-1">
                    Thẻ hợp lệ
                  </h3>
                </div>
              )}

              <div
                className={`rounded-xl p-3 border w-full text-left space-y-1.5 ${
                  isMonthlyPlateMismatch
                    ? "bg-red-50/60 border-red-200"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Mã thẻ</span>
                  <span className="font-semibold text-slate-800">
                    {cardCheck.cardCode}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Loại thẻ</span>
                  <span className="font-semibold text-slate-800">
                    {cardCheck.entryCardType}
                  </span>
                </div>
                {cardCheck.monthlyPassId && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Biển số đăng ký</span>
                    <span className="font-bold text-blue-700">
                      {cardCheck.plateNumber || "--"}
                    </span>
                  </div>
                )}
                {isMonthlyPlateMismatch && (
                  <div className="flex justify-between text-xs pt-1 border-t border-red-200">
                    <span className="text-red-600 font-bold">
                      Biển số quét được
                    </span>
                    <span className="font-black text-red-700">
                      {detectedPlate || "--"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {reservationCheck && (
            <div className="w-full flex flex-col gap-2">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-emerald-700 mt-1">
                  {formatReservationHeadline(reservationCheck.status)}
                </h3>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 w-full text-left space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className="font-semibold text-slate-800">{reservationCheck.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Mã Booking</span>
                  <span className="font-semibold text-slate-800">
                    {reservationCheck.reservationCode || reservationCheck.reservationId}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Khu vực đặt</span>
                  <span className="font-semibold text-slate-800">
                    {reservationCheck.reservedAreaCode || reservationCheck.reservedAreaId}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Vị trí đặt</span>
                  <span className="font-semibold text-slate-800">
                    {reservationCheck.reservedSlotCode || reservationCheck.reservedSlotId}
                  </span>
                </div>
                {typeof reservationCheck.plateRequiredAtEntry === "boolean" && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Bắt buộc biển số</span>
                    <span className="font-semibold text-slate-800">
                      {reservationCheck.plateRequiredAtEntry ? "Có" : "Không"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!cardCheck && !reservationCheck && (
          <div className="mt-2 w-full rounded-xl bg-amber-50 border border-amber-200 p-2 flex gap-2 items-start shrink-0">
            <div className="bg-amber-100 p-1 rounded-lg text-amber-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 leading-tight">Chờ thao tác...</p>
              <p className="text-[10px] text-amber-700 mt-0.5 leading-tight">
                Vui lòng điền đủ thông tin, nhập mã thẻ và kiểm tra.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
