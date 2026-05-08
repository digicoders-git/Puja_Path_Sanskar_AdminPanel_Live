import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMemo } from "react";
import { FaLayerGroup, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";

const cnt = (arr, key) =>
  arr.reduce((acc, item) => {
    const val = item[key] || "Unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

const base = {
  credits: { enabled: false },
  chart: { style: { fontFamily: "inherit" }, backgroundColor: "#ffffff" },
  title: { style: { fontSize: "12px", fontWeight: "700", color: "#1e293b" } },
  tooltip: { style: { fontSize: "11px" } },
  legend: { itemStyle: { fontSize: "10px", fontWeight: "600", color: "#64748b" } },
};

export default function PujaCharts({ pujas }) {
  const s = useMemo(() => {
    if (!pujas.length) return null;

    const active = pujas.filter((p) => p.isActive).length;
    const pujaType = cnt(pujas, "pujaType");
    const duration = cnt(pujas, "duration");

    // Duration groups
    const durationGroups = { "< 1 Hr": 0, "1-2 Hrs": 0, "2-4 Hrs": 0, "Half Day": 0, "Full Day": 0, "Other": 0 };
    pujas.forEach((p) => {
      const d = (p.duration || "").toLowerCase();
      if (d.includes("full day") || d.includes("full-day")) durationGroups["Full Day"]++;
      else if (d.includes("half day") || d.includes("half-day")) durationGroups["Half Day"]++;
      else if (d.includes("1") && (d.includes("hr") || d.includes("hour"))) durationGroups["1-2 Hrs"]++;
      else if (d.includes("2") || d.includes("3") || d.includes("4")) durationGroups["2-4 Hrs"]++;
      else if (d.includes("30") || d.includes("45") || d.includes("min")) durationGroups["< 1 Hr"]++;
      else durationGroups["Other"]++;
    });

    return {
      total: pujas.length,
      active,
      inactive: pujas.length - active,
      uniqueTypes: Object.keys(pujaType).length,
      pujaType,
      duration,
      durationGroups,
    };
  }, [pujas]);

  if (!s) return null;

  // ── STAT CARDS ──
  const statCards = [
    { label: "Total Pujas", value: s.total, icon: FaLayerGroup, color: THEME, bg: THEME_LIGHT },
    { label: "Active", value: s.active, icon: FaCheckCircle, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Inactive", value: s.inactive, icon: FaTimesCircle, color: "#ef4444", bg: "#fef2f2" },
    { label: "Puja Types", value: s.uniqueTypes, icon: FaClock, color: "#7c3aed", bg: "#f5f3ff" },
  ];

  const specColors = [THEME, "#f97316", "#fb923c", "#1e3a8a", "#2563eb", "#7c3aed", "#059669", "#0891b2", "#d97706", "#ec4899"];

  // 1. Donut — Active vs Inactive
  const c1 = {
    ...base,
    chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Active vs Inactive Pujas" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { innerSize: "60%", dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "10px" } } } },
    series: [{ name: "Pujas", colorByPoint: true, data: [{ name: "Active", y: s.active, color: "#16a34a" }, { name: "Inactive", y: s.inactive, color: "#ef4444" }] }],
  };

  // 2. Pie — Puja Type Distribution
  const c2 = {
    ...base,
    chart: { ...base.chart, type: "pie", height: 240 },
    title: { ...base.title, text: "Puja Type Distribution" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
    plotOptions: { pie: { dataLabels: { enabled: true, format: "{point.name}: {point.y}", style: { fontSize: "9px" } } } },
    series: [{
      name: "Pujas", colorByPoint: true,
      data: Object.entries(s.pujaType).sort((a, b) => b[1] - a[1]).map(([name, y], i) => ({ name, y, color: specColors[i % specColors.length] })),
    }],
  };

  // 3. Column — Puja Type Count
  const typeArr = Object.entries(s.pujaType).sort((a, b) => b[1] - a[1]);
  const c3 = {
    ...base,
    chart: { ...base.chart, type: "column", height: 240 },
    title: { ...base.title, text: "Pujas by Type" },
    xAxis: { categories: typeArr.map(([k]) => k), labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pujas" },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { fontSize: "10px" } }, colorByPoint: true, colors: specColors } },
    series: [{ name: "Pujas", data: typeArr.map(([, v]) => v), showInLegend: false }],
  };

  // 4. Column — Duration Groups
  const durArr = Object.entries(s.durationGroups).filter(([, v]) => v > 0);
  const c4 = {
    ...base,
    chart: { ...base.chart, type: "column", height: 240 },
    title: { ...base.title, text: "Duration Groups" },
    xAxis: { categories: durArr.map(([k]) => k), labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pujas" },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { fontSize: "10px" } }, colorByPoint: true, colors: ["#fdba74", "#f97316", THEME, "#a83e0d", "#7c2d12", "#94a3b8"] } },
    series: [{ name: "Pujas", data: durArr.map(([, v]) => v), showInLegend: false }],
  };

  // 5. Bar — Duration breakdown
  const durRaw = Object.entries(s.duration).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const c5 = {
    ...base,
    chart: { ...base.chart, type: "bar", height: 260 },
    title: { ...base.title, text: "Top Durations" },
    xAxis: { categories: durRaw.map(([k]) => k), labels: { style: { fontSize: "9px", color: "#64748b" } } },
    yAxis: { title: { text: null }, allowDecimals: false },
    tooltip: { valueSuffix: " pujas" },
    plotOptions: { bar: { borderRadius: 4, dataLabels: { enabled: true, style: { fontSize: "9px" } }, color: THEME } },
    series: [{ name: "Pujas", data: durRaw.map(([, v]) => v), showInLegend: false }],
  };

  const charts = [c1, c2, c3];

  // ── TYPE PROGRESS DIAGRAM ──
  const typeProgress = Object.entries(s.pujaType)
    .sort((a, b) => b[1] - a[1])
    .map(([label, val], i) => ({
      label, val,
      pct: s.total ? Math.round((val / s.total) * 100) : 0,
      color: specColors[i % specColors.length],
    }));

  return (
    <div className="mb-6 space-y-5">

      {/* ── STAT CARDS ── */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: THEME }} />
          <h3 className="text-sm font-bold text-gray-800">📊 Overview</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
            {s.total} Total Pujas
          </span>
        </div>
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

      {/* ── CHARTS ── */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: THEME }} />
          <h3 className="text-sm font-bold text-gray-800">📈 Charts & Analytics</h3>
        </div>
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
