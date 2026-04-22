import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Topbar from "../components/TopBar";

type Props = {
  children: React.ReactNode;
  onSearch?: (q: string) => void;
};

const AppLayout = ({ children, onSearch }: Props) => {
  // persisted collapsed state so layout doesn't reset across reloads
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("sidebarCollapsed");
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white">
      {/* Sidebar for md+ (controlled) */}
      <div className="hidden md:block md:fixed md:inset-y-0 md:left-0">
        <SideBar collapsed={collapsed} onToggle={() => setCollapsed((s) => !s)} />
      </div>

      {/* Main area: animate margin when sidebar toggles */}
      <div className={`transition-all duration-300 ${collapsed ? "md:ml-[68px]" : "md:ml-[240px]"}`}>
        {/* Topbar (aligned with page content) */}
        <div className="sticky top-0 z-30 bg-white/0">
          <div className="max-w-[1400px] mx-auto px-4">
            <Topbar onSearch={onSearch} />
          </div>
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
