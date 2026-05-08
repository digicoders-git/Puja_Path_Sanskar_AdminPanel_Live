import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMemo } from "react";
import {
  FaUsers, FaCheckCircle, FaTimesCircle, FaGraduationCap,
} from "react-icons/fa";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";

const cnt = (arr, key) =>
  arr.reduce((acc, item) => {
    const val = item[key] || "Unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

const avg = (arr, key) => {
  const vals = arr.map((p) => Number(p[key]) || 0).filter((v) => v > 0);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
};

const base = {
  credits: { enabled: false },
  chart: { style: { fontFamily: "inherit" }, backgroundColor: "#ffffff" },
  title: { style: { fontSize: "12px", fontWeight: "700", color: "#1e293b" } },
  legend: { itemStyle: { fontSize: "10px", fontWeight: "600", color: "#64748b" } },
  tooltip: { style: { fontSize: "11px" } },
};

export default function PanditCharts({ pandits }) {
  const s = useMemo(() => {
    if (!pandits.length) return null;

    const active = pandits.filter((p) => p.isActive).length;

    const expGroups = { "0-5 yrs": 0, "6-10 yrs": 0, "11-20 yrs": 0, "20+ yrs": 0 };
    pandits.forEach((p) => {
      const e = Number(p.totalExperience) || 0;
      if (e <= 5) expGroups["0-5 yrs"]++;
      else if (e <= 10) expGroups["6-10 yrs"]++;
      else if (e <= 20) expGroups["11-20 yrs"]++;
      else expGroups["20+ yrs"]++;
    });

    const chargesData = pandits
      .filter((p) => p.fullName && Number(p.basicPujaCharges) > 0)
      .sort((a, b) => Number(b.basicPujaCharges) - Number(a.basicPujaCharges))
      .slice(0, 8);

    const travelWilling = cnt(pandits, "travelWillingness");
    const availability = cnt(pandits, "availabilityType");
    const mantraLevel = cnt(pandits, "mantraLevel");
    const pujaKit = cnt(pandits, "pujaKitProvided");
    const veda = cnt(pandits, "vedaSpecialization");
    const specialization = cnt(pandits, "specialization");
    const city = cnt(pandits, "city");
    const gender = cnt(pandits, "gender");

    const skills = {
      "Bhajan/Kirtan": pandits.filter((p) => p.bhajanKirtan).length,
      Astrology: pandits.filter((p) => p.astrology).length,
      Vastu: pandits.filter((p) => p.vastu).length,
      Havan: pandits.filter((p) => p.havan).length,
      Corporate: pandits.filter((p) => p.corporateExperience).length,
      "Online Puja": pandits.filter((p) => p.onlinePujaSupport).length,
    };

    const emergency = pandits.filter((p) => p.emergencyBooking).length;

    return {
      total: pandits.length, active, inactive: pandits.length - active,
      avgBasic: avg(pandits, "basicPujaCharges"),
      avgExp: avg(pandits, "totalExperience"),
      avgDist: avg(pandits, "maxDistance"),
      emergency,
      expGroups, chargesData, travelWilling, availability,
      mantraLevel, pujaKit, veda,
      specialization, city, gender, skills,
    };
  }, [pandits]);

  if (!s) return null;

  // ── STAT CARDS ──────────────────────────────────────────────
  const statCards = [
    { label: "Total Pandits", value: s.total, icon: FaUsers, color: THEME, bg: THEME_LIGHT },
    { label: "Active", value: s.active, icon: FaCheckCircle, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Inactive", value: s.inactive, icon: FaTimesCircle, color: "#ef4444", bg: "#fef2f2" },
    { label: "Avg Experience", value: `${s.avgExp} yrs`, icon: FaGraduationCap, color: "#7c3aed", bg: "#f5f3ff" },
  ];

  // ── CHART OPTIONS ────────────────────────────────────────────

  // 1. Donut — Active vs Inactive
  const c1 = {
    ...base, chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Active vs Inactive Pandits" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { innerSize: "60%", dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "10px" } } } },
    series: [{ name: "Pandits", colorByPoint: true, data: [{ name: "Active", y: s.active, color: "#16a34a" }, { name: "Inactive", y: s.inactive, color: "#ef4444" }] }],
  };

  // 2. Pie — Specialization
  const specColors = [THEME, "#f97316", "#fb923c", "#1e3a8a", "#2563eb", "#7c3aed", "#059669", "#0891b2"];
  const c2 = {
    ...base, chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Specialization Distribution" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "9px" } } } },
    series: [{ name: "Pandits", colorByPoint: true, data: Object.entries(s.specialization).sort((a, b) => b[1] - a[1]).map(([name, y], i) => ({ name, y, color: specColors[i % specColors.length] })) }],
  };

  // 3. Bar — Top Cities
  const cityArr = Object.entries(s.city).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const c3 = {
    ...base, chart: { ...base.chart, type: "bar", height: 280 },
    title: { ...base.title, text: "Pandits by City (Top 10)" },
    xAxis: { categories: cityArr.map(([c]) => c), labels: { style: { fontSize: "10px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pandits" },
    plotOptions: { bar: { borderRadius: 4, dataLabels: { enabled: true, style: { fontSize: "9px" } }, color: THEME } },
    series: [{ name: "Pandits", data: cityArr.map(([, v]) => v), showInLegend: false }],
  };

  // 4. Column — Experience Groups
  const c4 = {
    ...base, chart: { ...base.chart, type: "column", height: 240 },
    title: { ...base.title, text: "Experience Groups" },
    xAxis: { categories: Object.keys(s.expGroups), labels: { style: { fontSize: "10px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pandits" },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { fontSize: "10px" } }, colorByPoint: true, colors: ["#fdba74", "#f97316", THEME, "#a83e0d"] } },
    series: [{ name: "Pandits", data: Object.values(s.expGroups), showInLegend: false }],
  };

  // 5. Column — Skills
  const c5 = {
    ...base, chart: { ...base.chart, type: "column", height: 240 },
    title: { ...base.title, text: "Extra Skills Distribution" },
    xAxis: { categories: Object.keys(s.skills), labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pandits" },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { fontSize: "10px" } }, colorByPoint: true, colors: ["#1e3a8a", "#2563eb", "#3b82f6", "#7c3aed", "#059669", "#0891b2"] } },
    series: [{ name: "Pandits", data: Object.values(s.skills), showInLegend: false }],
  };

  // 6. Donut — Gender
  const gColors = { Male: "#2563eb", Female: "#ec4899", Other: "#8b5cf6" };
  const c6 = {
    ...base, chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Gender Distribution" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { innerSize: "50%", dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "10px" } } } },
    series: [{ name: "Pandits", colorByPoint: true, data: Object.entries(s.gender).map(([name, y]) => ({ name, y, color: gColors[name] || "#94a3b8" })) }],
  };

  // 7. Bar — Charges Comparison (Top 8 pandits)
  const c7 = {
    ...base, chart: { ...base.chart, type: "bar", height: 300 },
    title: { ...base.title, text: "Top 8 Pandits — Charge Comparison (₹)" },
    xAxis: { categories: s.chargesData.map((p) => p.fullName?.split(" ").slice(0, 2).join(" ")), labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: "Amount (₹)" }, labels: { style: { fontSize: "9px" } } },
    tooltip: { valuePrefix: "₹" },
    plotOptions: { bar: { borderRadius: 3, dataLabels: { enabled: false } } },
    legend: { enabled: true },
    series: [
      { name: "Basic Puja", data: s.chargesData.map((p) => Number(p.basicPujaCharges) || 0), color: THEME },
      { name: "Akhand Paath", data: s.chargesData.map((p) => Number(p.akhandPaathCharges) || 0), color: "#2563eb" },
      { name: "Per Day", data: s.chargesData.map((p) => Number(p.perDayCharges) || 0), color: "#16a34a" },
    ],
  };

  // 8. Pie — Veda Specialization
  const vedaColors = ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#1e3a8a", "#2563eb", "#3b82f6"];
  const c8 = {
    ...base, chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Veda Specialization" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "9px" } } } },
    series: [{ name: "Pandits", colorByPoint: true, data: Object.entries(s.veda).map(([name, y], i) => ({ name, y, color: vedaColors[i % vedaColors.length] })) }],
  };

  // 9. Column — Mantra Level
  const c9 = {
    ...base, chart: { ...base.chart, type: "column", height: 240 },
    title: { ...base.title, text: "Mantra Level" },
    xAxis: { categories: Object.keys(s.mantraLevel), labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pandits" },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { fontSize: "10px" } }, colorByPoint: true, colors: ["#fdba74", "#f97316", THEME, "#a83e0d", "#7c2d12"] } },
    series: [{ name: "Pandits", data: Object.values(s.mantraLevel), showInLegend: false }],
  };

  // 10. Donut — Travel Willingness
  const travelColors = ["#059669", "#0891b2", "#7c3aed", "#d97706", "#ef4444"];
  const c10 = {
    ...base, chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Travel Willingness" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { innerSize: "50%", dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "9px" } } } },
    series: [{ name: "Pandits", colorByPoint: true, data: Object.entries(s.travelWilling).map(([name, y], i) => ({ name, y, color: travelColors[i % travelColors.length] })) }],
  };

  // 11. Pie — Availability Type
  const c11 = {
    ...base, chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Availability Type" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "9px" } } } },
    series: [{ name: "Pandits", colorByPoint: true, data: Object.entries(s.availability).map(([name, y], i) => ({ name, y, color: specColors[i % specColors.length] })) }],
  };

  // 12. Column — Puja Kit Policy
  const c12 = {
    ...base, chart: { ...base.chart, type: "column", height: 240 },
    title: { ...base.title, text: "Puja Kit (Samagri) Policy" },
    xAxis: { categories: Object.keys(s.pujaKit), labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pandits" },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { fontSize: "10px" } }, colorByPoint: true, colors: ["#059669", "#0891b2", "#d97706", "#ef4444"] } },
    series: [{ name: "Pandits", data: Object.values(s.pujaKit), showInLegend: false }],
  };

  const charts = [c1, c2, c4, c5, c6, c8, c9, c11, c12];

  return (
    <div className="mb-6 space-y-6">

      {/* ── STAT CARDS ── */}
      <div>
        <SectionTitle title="📊 Overview Stats" count={`${s.total} Pandits`} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl p-5 flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: bg }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "25" }}>
                <Icon style={{ color }} className="text-xl" />
              </div>
              <div>
                <p className="text-2xl font-black leading-tight" style={{ color }}>{value}</p>
                <p className="text-sm text-gray-500 font-medium mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHARTS GRID ── */}
      <div>
        <SectionTitle title="📈 Charts & Analytics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {charts.map((opts, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow">
              <HighchartsReact highcharts={Highcharts} options={opts} />
            </div>
          ))}
        </div>
      </div>



    </div>
  );
}

function SectionTitle({ title, count }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: THEME }} />
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      {count && (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
          {count}
        </span>
      )}
    </div>
  );
}
