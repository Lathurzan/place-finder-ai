import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_MAIN = [
  {
    name: "Home",
    to: "/home",
    badge: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9"/>
      </svg>
    ),
  },
  {
    name: "Finder",
    to: "/finder",
    badge: "New",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="9" r="6"/>
        <path d="M15 15l3 3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: "Explore",
    to: "/explore",
    badge: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="8"/>
        <path d="M10 2a12 12 0 010 16M2 10h16" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: "Bookmarks",
    to: "/bookmarks",
    badge: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 3h10a1 1 0 011 1v13l-6-4-6 4V4a1 1 0 011-1z" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "Itineraries",
    to: "/itineraries",
    badge: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h12M4 8h8M4 12h10M4 16h6" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const NAV_ACCOUNT = [

  {
    name: "Settings",
    to: "/settings",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-5" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="2.5"/>
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/>
      </svg>
    ),
  },
];

const Sidebar = ({ collapsed: collapsedProp, onToggle }: { collapsed?: boolean; onToggle?: () => void }) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = typeof collapsedProp === "boolean" ? collapsedProp : internalCollapsed;
  const location = useLocation();

  const userName = (() => {
    try {
      const raw = localStorage.getItem("pf_user");
      return raw ? JSON.parse(raw).name : "Alex Johnson";
    } catch {
      return "Alex Johnson";
    }
  })();

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={`
        flex flex-col h-screen flex-shrink-0
        bg-[#060c18] border-r border-white/[0.07]
        transition-all duration-250 ease-in-out
        ${collapsed ? "w-[68px]" : "w-[240px]"}
      `}
      aria-label="Sidebar navigation"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-white/[0.07] min-h-[60px]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" fill="white"/>
              <circle cx="10" cy="8" r="2" fill="#059669"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-[13px] font-semibold text-white whitespace-nowrap leading-tight">
                Place Finder AI
              </div>
              <div className="text-[10px] text-white/40 whitespace-nowrap leading-tight mt-0.5">
                Discover the world
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (onToggle) onToggle(); else setInternalCollapsed((s) => !s);
          }}
          className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all flex-shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className={`w-3.5 h-3.5 transition-transform duration-250 ${collapsed ? "rotate-180" : ""}`}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M10 3L6 8l4 5"/>
          </svg>
        </button>
      </div>

      {/* ── Nav ── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5"
        onMouseEnter={() => {
          // preview expand on hover only when using internal state (uncontrolled)
          if (typeof collapsedProp !== "boolean" && internalCollapsed) setInternalCollapsed(false);
        }}
        onMouseLeave={() => {
          if (typeof collapsedProp !== "boolean" && internalCollapsed === false) setInternalCollapsed(true);
        }}
      >

        {/* Main section */}
        {!collapsed && (
          <p className="text-[10px] font-semibold tracking-widest text-white/25 uppercase px-2.5 pb-1.5 pt-1">
            Main
          </p>
        )}
        {collapsed && <div className="h-3" />}

        {NAV_MAIN.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              to={item.to}
              key={item.name}
              title={collapsed ? item.name : undefined}
              className={`
                group flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg
                transition-all duration-150 text-sm
                ${isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
                }
                ${collapsed ? "justify-center" : ""}
              `}
            >
              {/* Icon wrapper */}
              <div
                className={`
                  w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0
                  transition-colors duration-150
                  ${isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-white/[0.04] text-white/40 group-hover:bg-white/[0.07] group-hover:text-white/70"
                  }
                `}
              >
                {item.icon}
              </div>

              {!collapsed && (
                <>
                  <span className="flex-1 font-medium tracking-[-0.01em]">
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-bold bg-emerald-500 text-black px-1.5 py-0.5 rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Active indicator dot when collapsed */}
              {collapsed && isActive && (
                <span className="absolute right-1.5 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}

        {/* Account section */}
        <div className={`${collapsed ? "pt-3" : "pt-4"}`}>
          {!collapsed && (
            <p className="text-[10px] font-semibold tracking-widest text-white/25 uppercase px-2.5 pb-1.5">
              Account
            </p>
          )}
          {collapsed && <div className="border-t border-white/[0.06] mb-3" />}

          {NAV_ACCOUNT.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                to={item.to}
                key={item.name}
                title={collapsed ? item.name : undefined}
                className={`
                  group flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg
                  transition-all duration-150 text-sm
                  ${isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0
                    transition-colors duration-150
                    ${isActive
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-white/[0.04] text-white/40 group-hover:bg-white/[0.07] group-hover:text-white/70"
                    }
                  `}
                >
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="flex-1 font-medium tracking-[-0.01em]">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── User card ── */}
      <div className="px-2 py-3 border-t border-white/[0.07]">
        <div
          className={`
            flex items-center gap-2.5 px-2 py-2 rounded-lg
            hover:bg-white/[0.05] cursor-pointer transition-colors duration-150
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white shadow-md">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-[13px] font-semibold text-white/90 truncate leading-tight">
                {userName}
              </div>
              <div className="text-[11px] text-emerald-400/80 leading-tight mt-0.5">
                Pro plan
              </div>
            </div>
          )}
          {!collapsed && (
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-white/20 flex-shrink-0" stroke="currentColor" strokeWidth="2">
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;