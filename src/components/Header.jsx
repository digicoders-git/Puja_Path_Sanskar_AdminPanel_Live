// src/components/Header.jsx
import { memo, useState } from "react";
import { useFont } from "../context/FontContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { FaUserCircle, FaBell, FaBars } from "react-icons/fa";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

const BASE = import.meta.env.VITE_API_BASE_URL;

const Header = memo(({ toggleSidebar, currentPageTitle }) => {
  const { currentFont } = useFont();
  const { admin } = useAuth();
  const { themeColors } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);

  const avatarSrc = admin?.image ? `${BASE}/${admin.image}` : null;
  const isDark = themeColors.mode === "dark";

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 transition-all duration-200"
      style={{
        backgroundColor: isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isDark
          ? "0 1px 20px rgba(0,0,0,0.3)"
          : "0 1px 20px rgba(0,0,0,0.06)",
        fontFamily: currentFont.family,
      }}
    >
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            color: isDark ? "#e2e8f0" : "#374151",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark
              ? "rgba(255,255,255,0.15)"
              : "rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.05)";
          }}
          aria-label="Toggle sidebar"
        >
          <HiOutlineMenuAlt2 className="text-lg" />
        </button>

        {/* Breadcrumb style title */}
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-6 rounded-full hidden sm:block"
            style={{
              background: "linear-gradient(180deg, #f97316, #ea580c)",
            }}
          />
          <div>
            <p
              className="text-xs font-medium hidden sm:block"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
            >
              Admin Panel
            </p>
            <h2
              className="text-sm sm:text-base font-bold leading-tight"
              style={{ color: isDark ? "#f1f5f9" : "#1e293b" }}
            >
              {currentPageTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* Right: Notification + Admin Info + Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 relative"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              color: isDark ? "#e2e8f0" : "#374151",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.05)";
            }}
            aria-label="Notifications"
          >
            <FaBell className="text-sm" />
            {/* Red dot */}
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
              style={{
                backgroundColor: "#ef4444",
                borderColor: isDark ? "#0f172a" : "#fff",
              }}
            />
          </button>
        </div>

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-7"
          style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
        />

        {/* Admin Name + Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right">
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: isDark ? "#f1f5f9" : "#1e293b" }}
            >
              {admin?.name || "Admin"}
            </p>
            <p
              className="text-xs leading-tight"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
            >
              {admin?.role || "Administrator"}
            </p>
          </div>

          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background: avatarSrc
                ? "transparent"
                : "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 2px 10px rgba(249,115,22,0.35)",
              border: `2px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(249,115,22,0.3)"}`,
            }}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-xl" style={{ color: "#fff" }} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";
export default Header;
