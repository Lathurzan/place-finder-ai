// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../layouts/AppLayout";
import HomeMap from "../components/HomeMap";
import type { MapTab, BookmarkPin } from "../components/HomeMap";

// ── Tiny reusable primitives ─────────────────────────────────────────────
const Card = ({
  children, className = "", style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={style}
    className={`bg-white dark:bg-[#061826] border border-gray-100 dark:border-white/[0.06] rounded-2xl shadow-sm ${className}`}
  >
    {children}
  </div>
);

const SectionHead = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-white/[0.04]">
    <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">{title}</span>
    {action}
  </div>
);

const StatCard = ({
  label, value, icon, iconBg, iconColor,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) => (
  <Card className="flex items-center gap-3 p-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <svg
        className={`w-[18px] h-[18px] ${iconColor}`}
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        {icon}
      </svg>
    </div>
    <div>
      <div className="text-[22px] font-bold text-gray-900 dark:text-gray-100 leading-none">{value}</div>
      <div className="text-[11px] text-gray-400 dark:text-gray-400/80 mt-1">{label}</div>
    </div>
  </Card>
);

// ── Trending destinations — real names, geocoded by HomeMap ──────────────
const TRENDING = [
  { name: "Santorini",    country: "Greece",    emoji: "🏛️", rank: "#1" },
  { name: "Kyoto",        country: "Japan",     emoji: "🌸", rank: ""   },
  { name: "Amalfi Coast", country: "Italy",     emoji: "🌊", rank: ""   },
  { name: "New York",     country: "USA",       emoji: "🗽", rank: ""   },
  { name: "Patagonia",    country: "Argentina", emoji: "🏔️", rank: ""   },
  { name: "Serengeti",    country: "Tanzania",  emoji: "🦁", rank: ""   },
  { name: "Machu Picchu", country: "Peru",      emoji: "🏟️", rank: ""   },
];

const AI_MESSAGES = [
  { role: "ai",   text: "Hi! 👋 Where are you thinking of exploring? I can suggest places, build itineraries, or analyse a photo." },
  { role: "user", text: "Somewhere warm with great beaches in Europe." },
  { role: "ai",   text: "Santorini, Amalfi Coast, and Algarve are top picks. Want a 5-day itinerary for any of these?" },
];

const STATS = [
  {
    label: "Places discovered",
    value: 248,
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-500",
    icon: (<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>),
  },
  {
    label: "Bookmarked places",
    value: 9,
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    iconColor: "text-indigo-400",
    icon: <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>,
  },
  {
    label: "Saved itineraries",
    value: 3,
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-500",
    icon: (<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>),
  },
  {
    label: "Searches this month",
    value: 31,
    iconBg: "bg-pink-50 dark:bg-pink-500/10",
    iconColor: "text-pink-400",
    icon: (<><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>),
  },
];



const BOOKMARK_DISPLAY = [
  { name: "Fushimi Inari Taisha", location: "Kyoto, Japan",        cover: "⛩️", rating: 4.9 },
  { name: "Aman Tokyo",           location: "Tokyo, Japan",         cover: "🏨", rating: 4.9 },
  { name: "Santorini Caldera",    location: "Santorini, Greece",    cover: "🏝️", rating: 4.9 },
  { name: "Machu Picchu",         location: "Cusco, Peru",          cover: "🏔️", rating: 4.9 },
];

const ITINERARIES = [
  { title: "5 Days in Kyoto",        country: "Japan",     days: 5, date: "Mar 2025", emoji: "🏯", badge: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { title: "3-Day Santorini Escape", country: "Greece",    days: 3, date: "Feb 2025", emoji: "🏛️", badge: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"   },
  { title: "7-Day Patagonia Trek",   country: "Argentina", days: 7, date: "Jan 2025", emoji: "🏔️", badge: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"     },
];

const SEARCHES = [
  { query: "beaches in Greece",      time: "2h ago" },
  { query: "Kyoto cherry blossom",   time: "1d ago" },
  { query: "safari Tanzania",        time: "3d ago" },
  { query: "mountain trekking",      time: "5d ago" },
  { query: "romantic Europe cities", time: "1w ago" },
];

// ── Weather icon helper ──────────────────────────────────────────────────
function weatherEmoji(iconCode?: string): string {
  if (!iconCode) return "⛅";
  if (iconCode.startsWith("01")) return "☀️";
  if (iconCode.startsWith("02") || iconCode.startsWith("03")) return "⛅";
  if (iconCode.startsWith("09") || iconCode.startsWith("10")) return "🌧️";
  if (iconCode.startsWith("11")) return "⛈️";
  if (iconCode.startsWith("13")) return "❄️";
  return "🌤️";
}

// ════════════════════════════════════════════════════════════════════════
const Home = () => {
  const { theme }           = useTheme();
  const [searchQuery,  setSearchQuery]  = useState("");
  const [chatInput,    setChatInput]    = useState("");
  const [messages,     setMessages]     = useState(AI_MESSAGES);
  const [mapView,      setMapView]      = useState<MapTab>("Bookmarks");
  const [bookmarkPins, setBookmarkPins] = useState<BookmarkPin[]>([]);
  // Fetch bookmarks for map markers
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/bookmarks?user_id=1");
        if (!res.ok) throw new Error("Failed to fetch bookmarks");
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const pins = data.map((row: any) => ({
          name: row.name,
          location: [row.city, row.country].filter(Boolean).join(", "),
        }));
        if (mounted) setBookmarkPins(pins);
      } catch (e) {
        if (mounted) setBookmarkPins([]);
        // Optionally log error
        // console.error("Failed to fetch bookmarks for map", e);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [localWeather, setLocalWeather] = useState<any>(null);
  const [destWeather,  setDestWeather]  = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError,   setWeatherError]   = useState<string | null>(null);

  // ── Coordinates ────────────────────────────────────────────────────────
  const SANTORINI = { lat: 36.3932, lon: 25.4615 };
  const GLASGOW   = { lat: 55.8642, lon: -4.2518 };

  // ── Fetch weather on mount ─────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const ctrl  = new AbortController();

    const fetchWeather = async (lat: number, lon: number) => {
      const res = await fetch(
        `/api/weather/current?lat=${lat}&lon=${lon}&units=metric`,
        { signal: ctrl.signal }
      );
      if (!res.ok) throw new Error(`Weather API error ${res.status}`);
      return res.json();
    };

    const load = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        // Destination weather (Santorini)
        const dest = await fetchWeather(SANTORINI.lat, SANTORINI.lon);
        if (mounted) setDestWeather(dest);

        // Local weather — try geolocation, fallback to Glasgow
        const tryLocal = async (lat: number, lon: number) => {
          const loc = await fetchWeather(lat, lon);
          if (mounted) setLocalWeather(loc);
        };

        if (navigator?.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => tryLocal(pos.coords.latitude, pos.coords.longitude).catch(
              () => tryLocal(GLASGOW.lat, GLASGOW.lon)
            ),
            () => tryLocal(GLASGOW.lat, GLASGOW.lon)
          );
        } else {
          await tryLocal(GLASGOW.lat, GLASGOW.lon);
        }
      } catch (err: unknown) {
        if (mounted && !(err instanceof DOMException && err.name === "AbortError")) {
          setWeatherError(err instanceof Error ? err.message : "Weather unavailable");
        }
      } finally {
        if (mounted) setWeatherLoading(false);
      }
    };

    load();
    return () => { mounted = false; ctrl.abort(); };
  }, []);

  // ── AI chat send ───────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          message: text,
          history: messages.map((m) => ({
            role:  m.role === "ai" ? "model" : "user",
            parts: [m.text],
          })),
        }),
      });
      const data = await res.json();
      const reply =
        data.response || data.text || data.message ||
        "Great choice! Let me look that up for you.";
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "I'll search that for you and update the map." },
      ]);
    }
  };

  return (
    <AppLayout onSearch={setSearchQuery}>
      <div className="p-5 space-y-4 max-w-[1400px] mx-auto bg-gray-50 dark:bg-[#041226]">

        {/* ── Welcome row ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Good morning 👋
              </h1>
              <span className="text-[12px] px-2 py-1 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-100 font-medium">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </div>
            <p className="text-[13px] text-gray-400 dark:text-gray-300 mt-0.5">
              {searchQuery
                ? `Searching: "${searchQuery}"`
                : "You have 9 bookmarked places and 3 saved itineraries. Ready to explore?"}
            </p>
          </div>

          {/* Weather chip */}
          <div className="flex items-center gap-3 bg-white dark:bg-[#062235] border border-gray-100 dark:border-white/[0.06] rounded-2xl px-4 py-3 shadow-sm flex-shrink-0">
            <span className="text-[28px] leading-none">
              {weatherEmoji(localWeather?.raw?.weather?.[0]?.icon)}
            </span>
            <div>
              <div className="text-[20px] font-bold text-gray-900 dark:text-gray-100 leading-none">
                {weatherLoading ? (
                  <span className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-200">
                    <svg className="w-4 h-4 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                        strokeDasharray="31.4 31.4" strokeLinecap="round"/>
                    </svg>
                    Loading
                  </span>
                ) : localWeather
                  ? `${Math.round(localWeather.temp ?? 0)}°C`
                  : "—"}
              </div>
              <div className="text-[11px] text-gray-400 dark:text-gray-300 mt-0.5">
                {weatherError
                  ? "Weather unavailable"
                  : localWeather?.raw?.name ?? "Glasgow, UK"}
              </div>
            </div>
            <div className="text-[12px] text-gray-400 dark:text-gray-300 ml-1 capitalize">
              {!weatherLoading && (localWeather?.description ?? "Partly cloudy")}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── Main grid: Map + Right col ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">

          {/* ── Map card ── */}
          <Card className="overflow-hidden flex flex-col min-h-[420px] h-full">
            {/* Tab bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-white/[0.04]">
              <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">
                Live map
              </span>
              <div className="flex items-center gap-1.5">
                {(["Bookmarks", "Trending", "Nearby"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setMapView(v)}
                    className={`text-[12px] font-medium px-3 py-1.5 rounded-full transition-all ${
                      mapView === v
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Real Leaflet map — uses live geocoding via HomeMap */}
            <HomeMap bookmarks={bookmarkPins} mapView={mapView} />
          </Card>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">

            {/* AI Chat — live backend */}
            <Card className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 dark:border-white/[0.04]">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">AI Travel Assistant</div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online — ready to help
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[200px] bg-gray-50/50 dark:bg-white/[0.01]">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                      m.role === "ai"
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                        : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300"
                    }`}>
                      {m.role === "ai" ? "AI" : "Me"}
                    </div>
                    <div className={`max-w-[170px] text-[12px] leading-relaxed rounded-xl px-3 py-2 ${
                      m.role === "ai"
                        ? "bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/[0.06] text-gray-700 dark:text-white/70 rounded-tl-none"
                        : "bg-emerald-500 text-white rounded-tr-none"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 p-3 border-t border-gray-50 dark:border-white/[0.04]">
                <input
                  type="text"
                  placeholder="Ask about any destination…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]
                    rounded-xl px-3 py-2 text-[12px] text-gray-700 dark:text-white/70 outline-none
                    placeholder-gray-400 dark:placeholder-white/20 focus:border-emerald-300 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </Card>

            {/* Bookmarked places — no mock images, use emoji covers */}
            <Card>
              <SectionHead
                title="Bookmarked places"
                action={
                  <button className="text-[12px] text-emerald-500 hover:text-emerald-600 font-medium">
                    View all
                  </button>
                }
              />
              <div className="px-3 py-2 space-y-1">
                {BOOKMARK_DISPLAY.map((b) => (
                  <div
                    key={b.name}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex-shrink-0 flex items-center justify-center text-lg">
                      {b.cover}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-gray-800 dark:text-white/80 truncate">
                        {b.name}
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-white/35 truncate">
                        {b.location}
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-amber-500 flex-shrink-0">
                      ★ {b.rating}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Trending ── */}
        <Card>
          <SectionHead
            title="🔥 Trending this week"
            action={
              <button className="text-[12px] text-emerald-500 hover:text-emerald-600 font-medium">
                See all
              </button>
            }
          />
          <div className="flex gap-3 overflow-x-auto px-3 py-3 scrollbar-none">
            {TRENDING.map((t) => (
              <div
                key={t.name}
                className="flex-shrink-0 w-[120px] rounded-xl border border-gray-100 dark:border-white/[0.07] overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all bg-gray-50 dark:bg-white/[0.03]"
              >
                <div className="h-[72px] bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-3xl relative">
                  {t.emoji}
                  {t.rank && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber-400 text-white px-1.5 py-0.5 rounded-full">
                      {t.rank}
                    </span>
                  )}
                </div>
                <div className="px-2.5 py-2">
                  <div className="text-[12px] font-semibold text-gray-800 dark:text-white/80 truncate">{t.name}</div>
                  <div className="text-[10px] text-gray-400 dark:text-white/35">{t.country}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Bottom 3-col ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Recent searches */}
          <Card>
            <SectionHead
              title="Recent searches"
              action={
                <button className="text-[12px] text-gray-400 hover:text-red-400 font-medium transition-colors">
                  Clear all
                </button>
              }
            />
            <div className="px-3 py-2 space-y-0.5">
              {SEARCHES.map((s) => (
                <div
                  key={s.query}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-300 dark:text-white/20 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <span className="flex-1 text-[13px] text-gray-600 dark:text-white/50 truncate">{s.query}</span>
                  <span className="text-[11px] text-gray-300 dark:text-white/20 flex-shrink-0">{s.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Saved itineraries */}
          <Card>
            <SectionHead
              title="Saved itineraries"
              action={
                <button className="text-[12px] text-emerald-500 hover:text-emerald-600 font-medium">
                  View all
                </button>
              }
            />
            <div className="px-3 py-2 space-y-2">
              {ITINERARIES.map((it) => (
                <div
                  key={it.title}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.07] hover:border-emerald-200 dark:hover:border-emerald-500/20 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 cursor-pointer transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/[0.07] flex items-center justify-center text-lg flex-shrink-0">
                    {it.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-gray-800 dark:text-white/80 truncate">{it.title}</div>
                    <div className="text-[11px] text-gray-400 dark:text-white/35">{it.country} · {it.date}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${it.badge}`}>
                    {it.days}d
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Destination weather — live API */}
          <Card
            className="overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1a3a4a,#0f2030)" }}
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-white">Destination weather</span>
              <button className="text-[12px] text-emerald-400 hover:text-emerald-300 font-medium">
                Compare
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[40px] leading-none">
                  {weatherEmoji(destWeather?.raw?.weather?.[0]?.icon)}
                </span>
                <div>
                  <div className="text-[32px] font-bold text-white leading-none">
                    {destWeather ? `${Math.round(destWeather.temp ?? 0)}°C` : "—"}
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    {destWeather?.raw?.name ?? "Santorini, Greece"}
                  </div>
                  <div className="text-[12px] text-white/70 mt-1 capitalize">
                    {destWeather
                      ? `${destWeather.description} · ${destWeather.raw?.weather?.[0]?.main ?? ""}`
                      : "Clear skies · great for beaches"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Humidity", val: destWeather?.raw?.main?.humidity != null ? `${destWeather.raw.main.humidity}%` : "—" },
                  { label: "Wind",     val: destWeather?.raw?.wind?.speed    != null ? `${Math.round(destWeather.raw.wind.speed * 3.6)} km/h` : "—" },
                  { label: "Feels like", val: destWeather?.raw?.main?.feels_like != null ? `${Math.round(destWeather.raw.main.feels_like)}°C` : "—" },
                  { label: "Best time", val: "Apr – Oct" },
                ].map((w) => (
                  <div key={w.label} className="bg-white/[0.08] rounded-xl px-3 py-2">
                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">{w.label}</div>
                    <div className="text-[15px] font-semibold text-white mt-0.5">{w.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;