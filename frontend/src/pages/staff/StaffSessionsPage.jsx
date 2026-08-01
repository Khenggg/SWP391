import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Search, LogOut, FileWarning, CheckCircle2, Clock, Car, CreditCard } from "lucide-react";
import { staffSessionService } from "@/services/staffSessionService";
import { formatDateTime } from "@/lib/format";
import { PageHeader, PageShell } from "@/components/layout/PageScaffold";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";

export default function StaffSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSessions = async () => {
    setIsLoading(true);
    setError("");
    try {
      setSessions(await staffSessionService.listActiveSessions());
    } catch (loadError) {
      setSessions([]);
      setError(loadError.message || "Không thể tải danh sách phiên đang trong bãi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return sessions;
    return sessions.filter((item) =>
      `${item.sessionCode} ${item.cardCode} ${item.plateNumber || ""} ${item.vehicleDescription || ""} ${item.vehicleTypeName} ${item.paymentStatus}`
        .toLowerCase()
        .includes(text)
    );
  }, [query, sessions]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Staff · Operations"
        title="Tìm kiếm phiên gửi"
        description="Danh sách xe đang trong bãi để Staff xử lý nhanh tại cổng ra, báo mất thẻ hoặc tra cứu trạng thái thanh toán."
        icon={Search}
        actions={
          <Button variant="outline" onClick={loadSessions} disabled={isLoading}>
            <RefreshCw data-icon="inline-start" className={isLoading ? "animate-spin" : ""} />
            Tải lại
          </Button>
        }
      />

      <Card className="app-card">
        <CardHeader>
          <CardTitle>Bộ lọc nhanh</CardTitle>
          <CardDescription>Tìm theo mã phiên, mã thẻ, biển số, loại xe hoặc trạng thái thanh toán.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col gap-1.5">
            <span className="app-field-label">Từ khóa</span>
            <div className="flex items-center gap-2">
              <Search aria-hidden="true" className="text-muted-foreground h-4 w-4" />
              <Input
                name="staff-session-search"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nhập biển số, mã thẻ hoặc mã phiên..."
              />
            </div>
          </label>
        </CardContent>
      </Card>

      <Card className="app-table-card">
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Đang tải danh sách phiên...</div>
          ) : error ? (
            <div className="p-8 text-center text-sm font-medium text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon="P" title="Không có phiên phù hợp" description="Thử đổi từ khóa hoặc tải lại danh sách phiên." className="border-0 shadow-none" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="font-semibold">Phiên & Thẻ</TableHead>
                  <TableHead className="font-semibold">Phương tiện</TableHead>
                  <TableHead className="font-semibold">Vị trí đỗ</TableHead>
                  <TableHead className="font-semibold">Thời gian vào</TableHead>
                  <TableHead className="font-semibold">Thanh toán</TableHead>
                  <TableHead className="text-right font-semibold pr-4">Thao tác xử lý</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((session) => {
                  const targetQuery = encodeURIComponent(session.plateNumber || session.cardCode || "");
                  const isPaid = session.paymentStatus === "PAID";
                  const isExpired = isPaid && session.paymentValidUntil && new Date() > new Date(session.paymentValidUntil);

                  return (
                    <TableRow key={session.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="font-mono font-bold text-slate-800">{session.sessionCode}</div>
                        <div className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 inline-block mt-0.5">
                          {session.cardCode || "Chưa gán thẻ"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono font-bold text-slate-900">{session.noPlate ? "Không biển số" : (session.plateNumber || "---")}</div>
                        {session.noPlate && session.vehicleDescription && <div className="text-xs text-amber-700">{session.vehicleDescription}</div>}
                        <div className="text-xs text-slate-500 font-medium">{session.vehicleTypeName}</div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {session.slotCode || session.areaCode || "Chưa xếp vị trí"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {formatDateTime(session.entryTime)}
                      </TableCell>
                      <TableCell>
                        {isPaid ? (
                          isExpired ? (
                            <>
                              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-semibold inline-flex items-center gap-1">
                                <Clock className="h-3 w-3 text-rose-600" />
                                Quá hạn ra xe
                              </Badge>
                              <div className="text-[10px] text-rose-600 font-medium mt-0.5 whitespace-nowrap">
                                Hết hạn ra xe: {formatDateTime(session.paymentValidUntil)}
                              </div>
                            </>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Đã thanh toán
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-semibold inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Chưa thanh toán
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            asChild
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs h-8 px-3 rounded-lg shadow-sm transition-all"
                          >
                            <Link to={`/staff/exit?query=${targetQuery}`}>
                              <LogOut className="mr-1.5 h-3.5 w-3.5" />
                              Cho xe ra
                            </Link>
                          </Button>

                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-300 font-semibold text-xs h-8 px-3 rounded-lg transition-all"
                          >
                            <Link to={`/staff/lost-card?query=${targetQuery}`}>
                              <FileWarning className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
                              Báo mất thẻ
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
