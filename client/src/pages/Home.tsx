import { useState, useEffect } from "react";
import { mockPlaces } from "../mockData";
import AppLayout from "../layouts/AppLayout";

/* ── tiny reusable primitives ── */
const Card = ({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={style}
    className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}
  >
    {children}
  </div>
);

const SectionHead = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
    <span className="text-[13px] font-semibold text-gray-800">{title}</span>
    {action}
  </div>
);

/* ── stat card ── */
const StatCard = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) => (
  <Card className="flex items-center gap-3 p-4">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
    >
      <svg
        className={`w-[18px] h-[18px] ${iconColor}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
    </div>
    <div>
      <div className="text-[22px] font-bold text-gray-900 leading-none">
        {value}
      </div>
      <div className="text-[11px] text-gray-400 mt-1">{label}</div>
    </div>
  </Card>
);

/* ─────────────────────────────────────────────────────────── */

const STATS = [
  {
    label: "Places discovered",
    value: 248,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    icon: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    label: "Bookmarked places",
    value: 4,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-400",
    icon: <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />,
  },
  {
    label: "Saved itineraries",
    value: 3,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    ),
  },
  {
    label: "Searches this month",
    value: 31,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-400",
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </>
    ),
  },
];

const BOOKMARKS = mockPlaces.slice(0, 4);

const TRENDING = [
  { name: "Santorini",    country: "Greece",    emoji: "🏛️" },
  { name: "Kyoto",        country: "Japan",     emoji: "🌸" },
  { name: "Amalfi Coast", country: "Italy",     emoji: "🌊" },
  { name: "New York",     country: "USA",       emoji: "🗽" },
  { name: "Patagonia",    country: "Argentina", emoji: "🏔️" },
  { name: "Serengeti",    country: "Tanzania",  emoji: "🦁" },
  { name: "Machu Picchu", country: "Peru",      emoji: "🏟️" },
];

const ITINERARIES = [
  { title: "5 Days in Kyoto",         country: "Japan",     days: 5,  date: "Mar 2025", emoji: "🏯", badge: "bg-emerald-50 text-emerald-700" },
  { title: "3-Day Santorini Escape",  country: "Greece",    days: 3,  date: "Feb 2025", emoji: "🏛️", badge: "bg-indigo-50 text-indigo-600"  },
  { title: "7-Day Patagonia Trek",    country: "Argentina", days: 7,  date: "Jan 2025", emoji: "🏔️", badge: "bg-amber-50 text-amber-600"   },
];

const SEARCHES = [
  { query: "beaches in Greece",       time: "2h ago"  },
  { query: "Kyoto cherry blossom",    time: "1d ago"  },
  { query: "safari Tanzania",         time: "3d ago"  },
  { query: "mountain trekking",       time: "5d ago"  },
  { query: "romantic Europe cities",  time: "1w ago"  },
];

const MAP_PINS = [
  { label: "Santorini", emoji: "🏛️", color: "bg-emerald-500", left: "36%", top: "55%" },
  { label: "Kyoto",     emoji: "🏯", color: "bg-indigo-500",  left: "62%", top: "38%" },
  { label: "Amalfi",   emoji: "🌊", color: "bg-amber-500",   left: "22%", top: "68%" },
  { label: "Banff",    emoji: "🏔️", color: "bg-cyan-500",    left: "78%", top: "62%" },
];

const AI_MESSAGES = [
  { role: "ai",   text: "Hi Alex! 👋 Where are you thinking of exploring next? I can suggest places, build itineraries, or identify a location from a photo." },
  { role: "user", text: "I want somewhere warm with great beaches in Europe." },
  { role: "ai",   text: "Perfect! Santorini, Amalfi Coast, and Algarve are top picks. I've pinned them on your map. Want a 5-day itinerary?" },
];

/* ─────────────────────────────────────────────────────────── */

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(AI_MESSAGES);
  const [mapView, setMapView] = useState<"Bookmarks" | "Trending" | "Nearby">("Bookmarks");

  // Weather state
  const [localWeather, setLocalWeather] = useState<any | null>(null);
  const [destWeather, setDestWeather] = useState<any | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Default coordinates
  const SANTORINI = { lat: 36.3932, lon: 25.4615 };
  const GLASGOW = { lat: 55.8642, lon: -4.2518 };

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchWeather = async (lat: number, lon: number) => {
      const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}&units=metric`, { signal: controller.signal });
      if (!res.ok) throw new Error(`Weather API ${res.status}`);
      return res.json();
    };

    const load = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        // Destination weather (Santorini)
        const dest = await fetchWeather(SANTORINI.lat, SANTORINI.lon);
        if (!mounted) return;
        setDestWeather(dest);

        // Try to get browser geolocation for local weather, fallback to Glasgow
        if (navigator?.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
              const loc = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
              if (!mounted) return;
              setLocalWeather(loc);
            } catch (err) {
              const fallback = await fetchWeather(GLASGOW.lat, GLASGOW.lon);
              if (!mounted) return;
              setLocalWeather(fallback);
            }
          }, async () => {
            const fallback = await fetchWeather(GLASGOW.lat, GLASGOW.lon);
            if (!mounted) return;
            setLocalWeather(fallback);
          });
        } else {
          const fallback = await fetchWeather(GLASGOW.lat, GLASGOW.lon);
          if (!mounted) return;
          setLocalWeather(fallback);
        }
      } catch (err: any) {
        setWeatherError(err.message || String(err));
      } finally {
        if (mounted) setWeatherLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: chatInput },
      { role: "ai",   text: "Great choice! I'll search that for you and update the map." },
    ]);
    setChatInput("");
  };

  return (
    <AppLayout onSearch={setSearchQuery}>
      <div className="p-5 space-y-4 max-w-[1400px] mx-auto">

        {/* ── Welcome row ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
              Good morning, Alex 👋
            </h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              You have 4 bookmarked places and 3 saved itineraries. Ready to explore?
            </p>
            {searchQuery && (
              <p className="text-[12px] text-emerald-600 mt-1">
                Searching: &quot;{searchQuery}&quot;
              </p>
            )}
          </div>

          {/* Weather chip */}
          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex-shrink-0">
            <span className="text-[28px] leading-none">{localWeather ? (localWeather.raw?.weather?.[0]?.icon?.startsWith('0') ? '⛅' : '🌤️') : '⛅'}</span>
            <div>
              <div className="text-[20px] font-bold text-gray-900 leading-none">{localWeather ? `${Math.round(localWeather.temp)}°C` : '18°C'}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{localWeather ? localWeather.raw?.name : 'Glasgow, UK'}</div>
            </div>
            <div className="text-[12px] text-gray-400 ml-1">{localWeather ? localWeather.description : 'Partly cloudy'}</div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── Main grid: Map + Right col ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">

          {/* Map card */}
          <Card className="overflow-hidden">
            {/* Map topbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <span className="text-[13px] font-semibold text-gray-800">Live map</span>
              <div className="flex items-center gap-1.5">
                {(["Bookmarks", "Trending", "Nearby"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setMapView(v)}
                    className={`
                      text-[12px] font-medium px-3 py-1.5 rounded-full transition-all
                      ${mapView === v
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }
                    `}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Fake tile map */}
            <div className="relative h-[300px] overflow-hidden">
              <div className="grid grid-cols-6 grid-rows-4 h-full w-full">
                {[
                  "#b3d9f5","#c8e6c9","#c8e6c9","#a5d6a7","#b3d9f5","#b3d9f5",
                  "#b3d9f5","#c8e6c9","#a5d6a7","#e8e0f0","#c8e6c9","#b3d9f5",
                  "#c8e6c9","#a5d6a7","#f5f5dc","#c8e6c9","#a5d6a7","#c8e6c9",
                  "#a5d6a7","#e8e0f0","#c8e6c9","#b3d9f5","#b3d9f5","#c8e6c9",
                ].map((bg, i) => (
                  <div key={i} style={{ background: bg }} />
                ))}
              </div>

              {/* Pins */}
              {MAP_PINS.map((pin) => (
                <div
                  key={pin.label}
                  className="absolute flex flex-col items-center group cursor-pointer"
                  style={{
                    left: pin.left,
                    top: pin.top,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  {/* Tooltip */}
                  <div className="
                    opacity-0 group-hover:opacity-100 transition-opacity
                    bg-gray-900 text-white text-[10px] font-semibold
                    px-2 py-0.5 rounded-md mb-1 whitespace-nowrap
                  ">
                    {pin.label}
                  </div>
                  <div className={`
                    w-8 h-8 rounded-full ${pin.color}
                    border-[3px] border-white shadow-lg
                    flex items-center justify-center text-[13px]
                    group-hover:scale-110 transition-transform
                  `}>
                    {pin.emoji}
                  </div>
                  <div className={`w-0.5 h-2 ${pin.color} rounded-b`} />
                </div>
              ))}

              {/* Zoom */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                {["+", "−"].map((z) => (
                  <button key={z} className="
                    w-7 h-7 bg-white border border-gray-200 rounded-lg
                    text-gray-600 text-sm font-medium
                    hover:bg-gray-50 transition-colors shadow-sm
                  ">
                    {z}
                  </button>
                ))}
              </div>
            </div>

            {/* Pin legend */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-50 flex-wrap">
              {MAP_PINS.map((pin) => (
                <button
                  key={pin.label}
                  className="flex items-center gap-1.5 border border-gray-100 rounded-full px-3 py-1 text-[12px] text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors bg-white"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${pin.color}`}
                  />
                  {pin.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* AI Chat */}
            <Card className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-gray-800">AI Travel Assistant</div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online — ready to help
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[200px] bg-gray-50/50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`
                      w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold
                      ${m.role === "ai"
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                        : "bg-indigo-100 text-indigo-600"
                      }
                    `}>
                      {m.role === "ai" ? "AI" : "AJ"}
                    </div>
                    <div className={`
                      max-w-[170px] text-[12px] leading-relaxed rounded-xl px-3 py-2
                      ${m.role === "ai"
                        ? "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                        : "bg-emerald-500 text-white rounded-tr-none"
                      }
                    `}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2 p-3 border-t border-gray-50">
                <input
                  type="text"
                  placeholder="Ask about any destination…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="
                    flex-1 bg-gray-50 border border-gray-100 rounded-xl
                    px-3 py-2 text-[12px] text-gray-700 outline-none
                    placeholder-gray-400 focus:border-emerald-300
                    transition-colors
                  "
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

            {/* Bookmarked places */}
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
                {BOOKMARKS.map((b: any) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      {b.image ? (
                        <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🏛️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-gray-800 truncate">{b.title || b.name}</div>
                      <div className="text-[11px] text-gray-400">{b.city || b.country}</div>
                    </div>
                    <div className="text-[11px] font-semibold text-amber-500 flex-shrink-0">★ 4.9</div>
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
                className="flex-shrink-0 w-[120px] rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all bg-gray-50"
              >
                <div className="h-[72px] bg-gray-100 flex items-center justify-center text-3xl relative">
                  {t.emoji}
                  {t.name === "Santorini" && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber-400 text-white px-1.5 py-0.5 rounded-full">
                      #1
                    </span>
                  )}
                </div>
                <div className="px-2.5 py-2">
                  <div className="text-[12px] font-semibold text-gray-800 truncate">{t.name}</div>
                  <div className="text-[10px] text-gray-400">{t.country}</div>
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
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <span className="flex-1 text-[13px] text-gray-600 truncate">{s.query}</span>
                  <span className="text-[11px] text-gray-300 flex-shrink-0">{s.time}</span>
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
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                    {it.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-gray-800 truncate">{it.title}</div>
                    <div className="text-[11px] text-gray-400">{it.country} · {it.date}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${it.badge}`}>
                    {it.days}d
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Weather */}
          <Card className="overflow-hidden" style={{ background: "linear-gradient(135deg,#1a3a4a,#0f2030)" }}>
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-white">Destination weather</span>
              <button className="text-[12px] text-emerald-400 hover:text-emerald-300 font-medium">
                Compare
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[40px] leading-none">{destWeather ? (destWeather.raw?.weather?.[0]?.icon?.startsWith('0') ? '☀️' : '🌤️') : '☀️'}</span>
                <div>
                  <div className="text-[32px] font-bold text-white leading-none">{destWeather ? `${Math.round(destWeather.temp)}°C` : '26°C'}</div>
                  <div className="text-[11px] text-white/50 mt-0.5">{destWeather ? destWeather.raw?.name || 'Santorini' : 'Santorini, Greece'}</div>
                  <div className="text-[12px] text-white/70 mt-1">{destWeather ? `${destWeather.description} · ${destWeather.raw?.weather?.[0]?.main}` : 'Clear skies · great for beaches'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Humidity", val: "62%" },
                  { label: "Wind",     val: "14 km/h" },
                  { label: "UV Index", val: "High 8" },
                  { label: "Best time",val: "Apr–Oct" },
                ].map((w) => (
                  <div key={w.label} className="bg-white/8 rounded-xl px-3 py-2">
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