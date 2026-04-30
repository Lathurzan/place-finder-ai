import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// ThemeToggle not used here
// import ThemeToggle from "./ThemeToggle";

type Props = {
  onSearch?: (query: string) => void;
};

const Topbar = ({ onSearch }: Props) => {
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="
      h-[60px] bg-white dark:bg-[#060c18] border-b border-gray-100 dark:border-white/[0.07]
      flex items-center gap-3 px-5
      flex-shrink-0 w-full
    ">

      {/* ── Search bar ── */}
      <div
        className="
          flex items-center gap-2 flex-1 max-w-[480px]
          bg-[#f5f3ef] dark:bg-white/[0.03] border border-transparent dark:border-transparent
          rounded-full px-4 h-[38px]
          focus-within:border-emerald-400 dark:focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-white/[0.06]
          transition-all duration-150 cursor-text
        "
        onClick={() => inputRef.current?.focus()}
      >
        {/* Search icon */}
        <svg
          className="w-[15px] h-[15px] text-gray-400 dark:text-white/40 flex-shrink-0"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search destinations, places, landmarks…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="
            flex-1 bg-transparent border-none outline-none
            text-[13px] text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-white/30
            font-medium
          "
        />

        {/* Voice + Image buttons */}
  <div className="flex items-center gap-0.5">
          <button
            title="Voice search"
            className="
              w-7 h-7 flex items-center justify-center rounded-full
              text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10
              transition-all duration-150
            "
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/>
            </svg>
          </button>

          <button
            title="Image search"
            className="
              w-7 h-7 flex items-center justify-center rounded-full
              text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10
              transition-all duration-150
            "
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Right side ── */}
  <div className="flex items-center gap-2 ml-auto">

        {/* Open Finder */}
        <button
          onClick={() => navigate("/finder")}
          className="
            flex items-center gap-1.5
            h-[34px] px-4 rounded-full
            border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[#060c18]
            text-[13px] font-medium text-gray-600 dark:text-white/80
            hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20
            transition-all duration-150
          "
        >
          <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Open Finder
        </button>

        {/* New trip */}
        <button
          onClick={() => navigate("/itineraries/new")}
          className="
            flex items-center gap-1.5
            h-[34px] px-4 rounded-full
            bg-emerald-500 hover:bg-emerald-600
            text-[13px] font-semibold text-white
            shadow-sm shadow-emerald-500/20
            transition-all duration-150 active:scale-[0.98]
          "
        >
          <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New trip
        </button>

        {/* Notification bell */}
  <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="
              w-[34px] h-[34px] flex items-center justify-center
              rounded-full border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[#060c18]
              text-gray-500 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20
              transition-all duration-150 relative
            "
          >
            <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {/* dot */}
            <span className="
              absolute top-[7px] right-[7px]
              w-[7px] h-[7px] rounded-full
              bg-emerald-500 border-2 border-white dark:border-[#060c18]
            "/>
          </button>
          
          {/* Dropdown */}
          {notifOpen && (
            <div className="
              absolute right-0 top-[calc(100%+8px)] w-[280px]
              bg-white/60 dark:bg-[#101a28]/80 backdrop-blur-sm border border-gray-100 dark:border-white/[0.07] rounded-3xl
              shadow-xl shadow-black/8 z-50 overflow-hidden
            ">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
                <span className="text-[13px] font-semibold text-gray-800 dark:text-white">Notifications</span>
                <span className="text-[11px] text-emerald-500 font-medium cursor-pointer hover:text-emerald-600">
                  Mark all read
                </span>
              </div>
              {[
                { title: "3 new place recommendations", time: "2m ago", unread: true },
                { title: "Your Kyoto itinerary was saved", time: "1h ago", unread: true },
                { title: "Trending: Santorini this week", time: "3h ago", unread: false },
              ].map((n, i) => (
                <div
                  key={i}
                  className={`
                    flex items-start gap-3 px-4 py-3
                    hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors
                    border-b border-gray-50 dark:border-white/[0.04] last:border-none
                  `}
                >
                  <div className={`
                    w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0
                    ${n.unread ? "bg-emerald-500" : "bg-transparent"}
                  `}/>
                  <div>
                    <p className="text-[13px] text-gray-700 dark:text-white font-medium leading-snug">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-white/40 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;