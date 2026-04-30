// src/pages/Sidebar.jsx
import { Link } from "react-router-dom";
import { memo, useState } from "react";
import {
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";

const SidebarItem = memo(({ route, isActive, onClose, currentPath }) => {
  const IconComponent = route.icon;
  const hasChildren = route.children && route.children.length > 0;
  const [isOpen, setIsOpen] = useState(() => {
    if (!hasChildren) return false;
    return route.children.some(
      (child) =>
        currentPath === child.path ||
        currentPath.startsWith(child.path + "/")
    );
  });

  if (hasChildren) {
    return (
      <div className="mb-1">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group"
          style={{
            backgroundColor: isActive
              ? "rgba(255,255,255,0.15)"
              : "transparent",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.08)",
              }}
            >
              <IconComponent className="text-sm" style={{ color: "#ffffff" }} />
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "#ffffff" }}
            >
              {route.name}
            </span>
          </div>
          {isOpen ? (
            <FaChevronDown size={10} style={{ color: "#ffffff" }} />
          ) : (
            <FaChevronRight size={10} style={{ color: "#ffffff" }} />
          )}
        </div>
        {isOpen && (
          <div className="ml-11 mt-1 space-y-1 border-l-2 pl-3" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
            {route.children.map((child) => (
              <SidebarItem
                key={child.path}
                route={child}
                isActive={
                  currentPath === child.path ||
                  (child.path !== "/" && currentPath.startsWith(child.path + "/"))
                }
                onClose={onClose}
                currentPath={currentPath}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={route.path}
      onClick={onClose}
      aria-current={isActive ? "page" : undefined}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
      style={{
        backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {/* Active left bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
          style={{ backgroundColor: "#fff" }}
        />
      )}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          backgroundColor: isActive
            ? "rgba(255,255,255,0.25)"
            : "rgba(255,255,255,0.08)",
        }}
      >
        <IconComponent
          className="text-sm"
          style={{ color: "#ffffff" }}
        />
      </div>
      <span
        className="text-sm font-semibold"
        style={{ color: "#ffffff" }}
      >
        {route.name}
      </span>
    </Link>
  );
});

SidebarItem.displayName = "SidebarItem";

const Sidebar = ({ isOpen, onClose, routes, currentPath, user, logout }) => {
  const visibleRoutes = routes.filter((r) => !r.hide);

  const isRouteActive = (route) => {
    if (route.children) return route.children.some((c) => isRouteActive(c));
    if (currentPath === route.path) return true;
    if (route.path !== "/" && currentPath.startsWith(route.path + "/")) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out w-64 flex flex-col`}
        style={{
          background: "linear-gradient(160deg, #E7611A 0%, #c94f12 50%, #a83e0d 100%)",
          borderRight: "1px solid rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo Section */}
        <div
          className="flex items-center justify-between h-16 px-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div

            >
              <img
                src="/logo.png"
                alt="logo"
                className="w-11 h-11 object-contain"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div>
              <h1 className="text-md font-bold leading-tight" style={{ color: "#fff" }}>
                PujaPath
              </h1>
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
                Sanskar Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Nav Label */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.75)" }}>
            Main Menu
          </p>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {visibleRoutes.map((route) => (
            <SidebarItem
              key={route.path || route.name}
              route={route}
              isActive={isRouteActive(route)}
              onClose={onClose}
              currentPath={currentPath}
            />
          ))}
        </div>

        {/* User + Logout */}
        <div
          className="p-3 m-3 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.2)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <FaUserCircle className="text-lg" style={{ color: "#fff" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "#ffffff" }}>
                {user?.name || "Admin"}
              </p>
              <p className="text-xs truncate font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
                {user?.role || "Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: "rgba(239,68,68,0.15)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.28)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)";
              e.currentTarget.style.color = "#fca5a5";
            }}
          >
            <FaSignOutAlt className="text-xs" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default memo(Sidebar);
