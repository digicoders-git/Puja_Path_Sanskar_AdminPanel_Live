import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  FaUsers, FaCheckCircle, FaTimesCircle, FaPrayingHands,
  FaEnvelope, FaLayerGroup, FaMoneyBillWave, FaCalendarCheck, FaClock, FaStar, FaUserTie
} from "react-icons/fa";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const BASE = import.meta.env.VITE_API_BASE_URL;
const COLORS = [THEME, "#2563eb", "#7c3aed", "#059669", "#d97706", "#0891b2", "#ec4899", "#f97316"];

const base = {
  credits: { enabled: false },
  chart: { style: { fontFamily: "inherit" }, backgroundColor: "#ffffff" },
  title: { style: { fontSize: "12px", fontWeight: "700", color: "#1e293b" } },
  tooltip: { style: { fontSize: "11px" } },
  legend: { itemStyle: { fontSize: "10px", fontWeight: "600", color: "#64748b" } },
};

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: THEME }} />
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-sm text-gray-400">No data available</p>
    </div>
  );

  const { summary, recentPandits, recentContacts, recentPujas, stats } = data;

  // ── STAT CARDS ──
  const statCards = [
    { label: "Total Revenue",   value: `₹${summary.totalEarnings?.toLocaleString("en-IN") || 0}`, icon: FaMoneyBillWave, color: "#16a34a",  bg: "#f0fdf4" },
    { label: "Total Bookings",  value: summary.totalBookings || 0,  icon: FaCalendarCheck, color: THEME,      bg: THEME_LIGHT },
    { label: "Pending Bookings",value: summary.pendingBookings || 0,icon: FaClock, color: "#f59e0b",  bg: "#fffbeb" },
    { label: "Total Leads",     value: summary.totalInterests || 0, icon: FaStar, color: "#8b5cf6",  bg: "#f5f3ff" },
    { label: "Total Users",     value: summary.totalUsers || 0,     icon: FaUsers, color: "#3b82f6",  bg: "#eff6ff" },
    { label: "Total Pandits",   value: summary.totalPandits || 0,   icon: FaUserTie, color: "#ec4899",  bg: "#fdf2f8" },
    { label: "Total Pujas",     value: summary.totalPujas || 0,     icon: FaPrayingHands,color: "#0891b2",  bg: "#ecfeff" },
    { label: "Total Enquiries", value: summary.totalContacts || 0,  icon: FaEnvelope, color: "#64748b",  bg: "#f8fafc" },
  ];

  // ── CHARTS ──

  // 1. Donut — Active vs Inactive Pandits
  const c1 = {
    ...base,
    chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Pandits Status" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { innerSize: "60%", dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "10px" } } } },
    series: [{ name: "Pandits", colorByPoint: true, data: [
      { name: "Active",   y: summary.activePandits,   color: "#16a34a" },
      { name: "Inactive", y: summary.inactivePandits, color: "#ef4444" },
    ]}],
  };

  // 2. Column — Specialization
  const c2 = {
    ...base,
    chart: { ...base.chart, type: "column", height: 240 },
    title: { ...base.title, text: "Specialization Stats" },
    xAxis: { categories: stats.specializationStats.map((s) => s._id), labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pandits" },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { fontSize: "10px" } }, colorByPoint: true, colors: COLORS } },
    series: [{ name: "Pandits", data: stats.specializationStats.map((s) => s.count), showInLegend: false }],
  };

  // 3. Bar — City Stats
  const c3 = {
    ...base,
    chart: { ...base.chart, type: "bar", height: 240 },
    title: { ...base.title, text: "Top Cities" },
    xAxis: { categories: stats.cityStats.map((s) => s._id), labels: { style: { fontSize: "10px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pandits" },
    plotOptions: { bar: { borderRadius: 4, dataLabels: { enabled: true, style: { fontSize: "9px" } }, color: THEME } },
    series: [{ name: "Pandits", data: stats.cityStats.map((s) => s.count), showInLegend: false }],
  };

  // 4. Pie — Contact Subjects
  const c4 = {
    ...base,
    chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Contact Subjects" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "9px" } } } },
    series: [{ name: "Contacts", colorByPoint: true, data: stats.contactSubjectStats.map((s, i) => ({ name: s._id, y: s.count, color: COLORS[i % COLORS.length] })) }],
  };

  // 5. Donut — Pujas Active vs Inactive
  const c5 = {
    ...base,
    chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Pujas Status" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { innerSize: "55%", dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "10px" } } } },
    series: [{ name: "Pujas", colorByPoint: true, data: [
      { name: "Active",   y: summary.activePujas,                          color: "#16a34a" },
      { name: "Inactive", y: summary.totalPujas - summary.activePujas,     color: "#ef4444" },
    ]}],
  };

  // 6. Column — Contact Subject Bar
  const c6 = {
    ...base,
    chart: { ...base.chart, type: "column", height: 240 },
    title: { ...base.title, text: "Enquiry Breakdown" },
    xAxis: { categories: stats.contactSubjectStats.map((s) => s._id), labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " contacts" },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { fontSize: "10px" } }, colorByPoint: true, colors: COLORS } },
    series: [{ name: "Contacts", data: stats.contactSubjectStats.map((s) => s.count), showInLegend: false }],
  };

  // 7. Column — Platform Overview
  const c7 = {
    ...base,
    chart: { ...base.chart, type: "column", height: 240 },
    title: { ...base.title, text: "Platform Overview" },
    xAxis: { categories: ["Users", "Bookings", "Leads", "Pujas", "Pandits"], labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " total" },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { fontSize: "10px" } }, colorByPoint: true, colors: ["#3b82f6", THEME, "#8b5cf6", "#0891b2", "#ec4899"] } },
    series: [{ name: "Count", data: [summary.totalUsers || 0, summary.totalBookings || 0, summary.totalInterests || 0, summary.totalPujas || 0, summary.totalPandits || 0], showInLegend: false }],
  };

  // 8. Donut — Bookings Status
  const c8 = {
    ...base,
    chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Bookings Pipeline" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { innerSize: "60%", dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "10px" } } } },
    series: [{ name: "Bookings", colorByPoint: true, data: [
      { name: "Pending",   y: summary.pendingBookings || 0, color: "#f59e0b" },
      { name: "Processed", y: (summary.totalBookings || 0) - (summary.pendingBookings || 0), color: "#16a34a" },
    ]}],
  };

  // 9. Pie — Puja Types
  const c9 = {
    ...base,
    chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Pujas by Type" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "9px" } } } },
    series: [{ name: "Pujas", colorByPoint: true, data: stats.pujaTypeStats?.map((s, i) => ({ name: s._id, y: s.count, color: COLORS[i % COLORS.length] })) || [] }],
  };

  return (
    <div className="min-h-screen p-3 sm:p-5 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Dashboard</h2>
          <p className="text-xs text-gray-400 mt-0.5">PujaPath Sanskar — Admin Overview</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
          🕉️ Live Data
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-4 flex flex-col gap-2 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
            style={{ backgroundColor: bg }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "22" }}>
              <Icon style={{ color }} className="text-base" />
            </div>
            <div>
              <p className="text-2xl font-black leading-tight" style={{ color }}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: THEME }} />
          <h3 className="text-sm font-bold text-gray-800">📈 Analytics & Charts</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {[c7, c8, c1, c5, c9, c4, c6, c2, c3].map((opts, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow">
              <HighchartsReact highcharts={Highcharts} options={opts} />
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM 3 TABLES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Recent Pandits */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${THEME}10, ${THEME}05)` }}>
            <p className="text-sm font-bold text-gray-800">🕉️ Recent Pandits</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
              {recentPandits.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPandits.map((p) => (
              <div key={p._id} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold overflow-hidden"
                  style={{ backgroundColor: THEME }}>
                  {p.profilePhoto
                    ? <img src={`${BASE}/${p.profilePhoto}`} className="w-full h-full object-cover" alt="" />
                    : p.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{p.specialization} • {p.city}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${p.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Pujas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, #7c3aed10, #7c3aed05)` }}>
            <p className="text-sm font-bold text-gray-800">🙏 Recent Pujas</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-600">
              {recentPujas.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPujas.map((p) => (
              <div key={p._id} className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50 overflow-hidden">
                  {p.image
                    ? <img src={`${BASE}/${p.image.replace(/\\/g, "/")}`} className="w-full h-full object-cover" alt="" />
                    : <span className="text-lg">🕉️</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.pujaName}</p>
                  <p className="text-xs text-gray-400 truncate">{p.pujaType}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${p.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, #d9770610, #d9770605)` }}>
            <p className="text-sm font-bold text-gray-800">📩 Recent Contacts</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-600">
              {recentContacts.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentContacts.map((c) => (
              <div key={c._id} className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-600 font-bold text-sm">
                  {c.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{c.subject}</p>
                </div>
                <p className="text-xs text-gray-300 flex-shrink-0">
                  {new Date(c.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, #16a34a10, #16a34a05)` }}>
            <p className="text-sm font-bold text-gray-800">📅 Recent Bookings</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-50 text-green-600">
              {data.recentBookings?.length || 0}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentBookings?.map((b) => (
              <div key={b._id} className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600 font-bold text-sm">
                  {b.puja?.pujaName?.charAt(0) || "B"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{b.puja?.pujaName || "Unknown Puja"}</p>
                  <p className="text-xs text-gray-400 truncate">{b.user?.name || "Unknown"} • ₹{b.amount}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${b.status === 'Confirmed' || b.status === 'Completed' ? "bg-green-100 text-green-600" : b.status === 'Cancelled' ? "bg-red-100 text-red-500" : "bg-orange-100 text-orange-600"}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── SPECIALIZATION PROGRESS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: THEME }} />
          <h3 className="text-sm font-bold text-gray-800">🎯 Specialization Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {stats.specializationStats.map(({ _id, count }, i) => {
            const pct = summary.totalPandits ? Math.round((count / summary.totalPandits) * 100) : 0;
            return (
              <div key={_id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-600">{_id}</span>
                  <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                    {count} <span className="text-gray-400 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
