import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Topbar from "../components/TopBar";

type Props = {
  children: React.ReactNode;
  onSearch?: (q: string) => void;
};

const AppLayout = ({ children, onSearch }: Props) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem("sidebarCollapsed") ?? "false"); }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed)); }
    catch {}
  }, [collapsed]);

  // --- Force Tailwind dark mode to sync with localStorage or system ---
  // --- Robust dark mode sync: always update <html> class on mount and on theme change ---
  useEffect(() => {
    function syncDarkClass() {
      let theme = localStorage.getItem("theme");
      if (!theme || theme === "system") {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    syncDarkClass();
    window.addEventListener("storage", syncDarkClass);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", syncDarkClass);
    return () => {
      window.removeEventListener("storage", syncDarkClass);
      mq.removeEventListener("change", syncDarkClass);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#041226]">
      {/* Sidebar — fixed width, full height */}
      <div className="flex-shrink-0">
        <SideBar collapsed={collapsed} onToggle={() => setCollapsed(s => !s)} />
      </div>

      {/* Right column: topbar + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="flex-shrink-0 z-30">
          <Topbar onSearch={onSearch} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;