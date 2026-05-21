import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Car, TrendingUp, DollarSign, Users, CreditCard, AlertTriangle,
  CheckCircle, BarChart2, Clock, ArrowUp, ArrowDown
} from "lucide-react";

const hourlyData = [
  { hour: "06h", vao: 8, ra: 0 }, { hour: "07h", vao: 22, ra: 3 },
  { hour: "08h", vao: 31, ra: 8 }, { hour: "09h", vao: 18, ra: 14 },
  { hour: "10h", vao: 11, ra: 22 }, { hour: "11h", vao: 14, ra: 19 },
  { hour: "12h", vao: 9, ra: 25 }, { hour: "13h", vao: 21, ra: 16 },
  { hour: "14h", vao: 14, ra: 14 },
];

const revenueWeekly = [
  { day: "T2", amount: 1240000 }, { day: "T3", amount: 980000 },
  { day: "T4", amount: 1560000 }, { day: "T5", amount: 1180000 },
  { day: "T6", amount: 1820000 }, { day: "T7", amount: 2100000 },
  { day: "CN", amount: 1640000 },
];

const occupancyData = [
  { name: "B1 – Xe máy/đạp", value: 95, total: 120, color: "#3b82f6" },
  { name: "B2 – Ô tô", value: 42, total: 60, color: "#8b5cf6" },
  { name: "B3 – Xe tải", value: 8, total: 20, color: "#f97316" },
];

const cardStatusData = [
  { name: "AVAILABLE", value: 96, color: "#22c55e" },
  { name: "IN_USE", value: 145, color: "#3b82f6" },
  { name: "LOST", value: 5, color: "#ef4444" },
  { name: "DAMAGED", value: 4, color: "#f97316" },
];

const activeSessions = [
  { card: "C004", plate: "51F-678.90", type: "🚗 Ô tô", floor: "B2/A/3", entry: "07:32", duration: "6g28p", fee: "42.500đ", status: "active" },
  { card: "C015", plate: "30A-456.78", type: "🚗 Ô tô", floor: "B2/B/7", entry: "08:14", duration: "5g46p", fee: "35.000đ", status: "active" },
  { card: "C003", plate: "51G-222.11", type: "🛵 Xe máy", floor: "B1/A/12", entry: "13:58", duration: "0g02p", fee: "5.000đ", status: "recent" },
  { card: "C019", plate: "29A-111.22", type: "🚲 Xe đạp", floor: "B1/B/4", entry: "09:20", duration: "4g40p", fee: "10.000đ", status: "active" },
  { card: "C007", plate: "50L-333.44", type: "🚗 Ô tô điện", floor: "B2/B/11", entry: "10:05", duration: "3g55p", fee: "30.000đ", status: "active" },
  { card: "C011", plate: "51B-555.66", type: "🚚 Xe tải", floor: "B3/A/2", entry: "06:30", duration: "7g30p", fee: "75.000đ", status: "long" },
];

function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string; sub?: string; icon: any; color: string; trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-xl font-bold text-gray-900 leading-tight">{value}</div>
        {sub && (
          <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
        )}
        {trend && (
          <div className={`text-xs font-medium mt-1 flex items-center gap-0.5 ${
            trend.startsWith("+") ? "text-green-600" : "text-red-500"
          }`}>
            {trend.startsWith("+") ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {trend} so hôm qua
          </div>
        )}
      </div>
    </div>
  );
}

export function ManagerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 text-lg">Dashboard Quản lý</h1>
          <p className="text-xs text-gray-500">Thứ Năm, 14/05/2026 · Cập nhật lúc 14:02</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Hệ thống hoạt động tốt
          </div>
          <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
            Trần Minh Quang – Quản lý
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* KPI cards row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Tổng ô đỗ" value="200" sub="B1: 120 · B2: 60 · B3: 20" icon={BarChart2} color="bg-blue-600" />
          <StatCard label="Ô trống hiện tại" value="55" sub="27.5% còn trống" icon={CheckCircle} color="bg-green-500" trend="+3" />
          <StatCard label="Đang có xe" value="145" sub="72.5% lấp đầy" icon={Car} color="bg-orange-500" trend="+12" />
          <StatCard label="Tỷ lệ lấp đầy" value="72.5%" sub="Trung bình 3 tầng" icon={TrendingUp} color="bg-purple-500" trend="+5%" />
        </div>

        {/* KPI cards row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Xe vào hôm nay" value="148" sub="Từ 06:00 đến nay" icon={ArrowDown} color="bg-blue-500" trend="+18" />
          <StatCard label="Xe ra hôm nay" value="121" sub="93 xe máy · 28 ô tô" icon={ArrowUp} color="bg-indigo-500" trend="+9" />
          <StatCard label="Doanh thu hôm nay" value="1.18M đ" sub="Mục tiêu: 2.0M đ" icon={DollarSign} color="bg-emerald-500" trend="+210.000đ" />
          <StatCard label="Thẻ AVAILABLE" value="55" sub="IN_USE: 145 · LOST: 5 · DAMAGED: 4" icon={CreditCard} color="bg-teal-500" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hourly in/out */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Xe vào/ra theo giờ hôm nay</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gVao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="vao" name="Xe vào" stroke="#3b82f6" strokeWidth={2} fill="url(#gVao)" />
                <Area type="monotone" dataKey="ra" name="Xe ra" stroke="#22c55e" strokeWidth={2} fill="url(#gRa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Card status pie */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái thẻ</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={cardStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cardStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} thẻ`]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {cardStatusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600 truncate">{d.name}</span>
                  <span className="font-semibold text-gray-900 ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue + Occupancy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Weekly revenue */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Doanh thu 7 ngày gần nhất</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">08 – 14/05/2026</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueWeekly} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString("vi-VN")}đ`]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="amount" name="Doanh thu" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Occupancy by floor */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Tỷ lệ lấp đầy theo tầng</h3>
            <div className="space-y-4">
              {occupancyData.map((f) => {
                const pct = Math.round((f.value / f.total) * 100);
                return (
                  <div key={f.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600 truncate">{f.name}</span>
                      <span className="text-xs font-bold ml-2" style={{ color: f.color }}>{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: f.color }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{f.value}/{f.total} ô</div>
                  </div>
                );
              })}
            </div>

            {/* Alerts */}
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Cảnh báo</h4>
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-2.5">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-700">B1 gần đầy (79.2%) – Cần điều phối</div>
              </div>
              <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl p-2.5">
                <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-orange-700">5 thẻ chưa xác nhận &gt; 8 giờ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active sessions table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Phiên gửi xe đang hoạt động (145)</h3>
            <button className="text-xs text-blue-600 hover:underline">Xem tất cả →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium">Thẻ</th>
                  <th className="text-left py-2 pr-4 font-medium">Biển số</th>
                  <th className="text-left py-2 pr-4 font-medium">Loại xe</th>
                  <th className="text-left py-2 pr-4 font-medium">Vị trí</th>
                  <th className="text-left py-2 pr-4 font-medium">Giờ vào</th>
                  <th className="text-left py-2 pr-4 font-medium">Thời gian</th>
                  <th className="text-left py-2 pr-4 font-medium">Phí tạm</th>
                  <th className="text-left py-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {activeSessions.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <span className="font-mono font-bold text-blue-700">{s.card}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md">{s.plate}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-gray-600">{s.type}</td>
                    <td className="py-2.5 pr-4 text-xs font-mono text-gray-700">{s.floor}</td>
                    <td className="py-2.5 pr-4 text-xs text-gray-600">{s.entry}</td>
                    <td className="py-2.5 pr-4 text-xs font-medium text-gray-800">{s.duration}</td>
                    <td className="py-2.5 pr-4 text-xs font-semibold text-orange-600">{s.fee}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.status === "recent" ? "bg-blue-100 text-blue-700" :
                        s.status === "long" ? "bg-orange-100 text-orange-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {s.status === "recent" ? "Mới vào" : s.status === "long" ? "Lâu >7h" : "Đang gửi"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
