import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Status = "planned" | "ongoing" | "completed";

interface Itinerary {
  id: number;
  title: string;
  destination: string;
  dates: string;
  days: number;
  status: Status;
  places: number;
  cover: string; // emoji used as placeholder cover
  tags: string[];
}

/* ─────────────────────────────────────────────
   Mock data
───────────────────────────────────────────── */
const MOCK: Itinerary[] = [
  {
    id: 1,
    title: "Tokyo & Kyoto Spring",
    destination: "Japan",
    dates: "May 3 – May 14, 2026",
    days: 11,
    status: "planned",
    places: 18,
    cover: "🗾",
    tags: ["Culture", "Food", "Nature"],
  },
  {
    id: 2,
    title: "Santorini Getaway",
    destination: "Greece",
    dates: "Jun 20 – Jun 27, 2026",
    days: 7,
    status: "planned",
    places: 9,
    cover: "🏝️",
    tags: ["Beach", "Relaxation"],
  },
  {
    id: 3,
    title: "New York City Long Weekend",
    destination: "USA",
    dates: "Mar 7 – Mar 10, 2026",
    days: 3,
    status: "completed",
    places: 12,
    cover: "🗽",
    tags: ["City", "Food", "Art"],
  },
  {
    id: 4,
    title: "Bali Retreat",
    destination: "Indonesia",
    dates: "Apr 18 – Apr 25, 2026",
    days: 7,
    status: "ongoing",
    places: 14,
    cover: "🌴",
    tags: ["Wellness", "Beach", "Culture"],
  },
  {
    id: 5,
    title: "Scottish Highlands Road Trip",
    destination: "Scotland",
    dates: "Aug 1 – Aug 8, 2026",
    days: 7,
    status: "planned",
    places: 10,
    cover: "🏔️",
    tags: ["Nature", "Adventure"],
  },
  {
    id: 6,
    title: "Paris Art & Food Tour",
    destination: "France",
    dates: "Feb 14 – Feb 18, 2026",
    days: 4,
    status: "completed",
    places: 11,
    cover: "🗼",
    tags: ["Art", "Food", "Romance"],
  },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const STATUS_STYLES: Record<Status, string> = {
  planned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ongoing: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-white/5 text-white/40 border-gray-200 dark:border-white/10",
};

const STATUS_DOT: Record<Status, string> = {
  planned: "bg-blue-400",
  ongoing: "bg-emerald-400 animate-pulse",
  completed: "bg-white/30",
};

const FILTERS: Array<Status | "all"> = ["all", "planned", "ongoing", "completed"];

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl px-5 py-4 min-w-[100px]">
      <span className={`text-2xl font-bold ${accent}`}>{value}</span>
      <span className="text-[11px] text-white/40 mt-1 whitespace-nowrap">{label}</span>
    </div>
  );
}

function ItineraryCard({
  item,
  onView,
}: {
  item: Itinerary;
  onView: (id: number) => void;
}) {
  return (
    <div className="group flex flex-col bg-white dark:bg-[#0b1528] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200">
      {/* Cover */}
      <div className="h-28 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/[0.04] dark:to-white/[0.01] flex items-center justify-center text-5xl select-none border-b border-gray-100 dark:border-white/[0.06]">
        {item.cover}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        {/* Status */}
        <span
          className={`self-start flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[item.status]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[item.status]}`} />
          {item.status}
        </span>

        {/* Title + destination */}
        <div>
          <h3 className="text-[14px] font-semibold text-white leading-snug group-hover:text-emerald-300 transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-[12px] text-white/40">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" />
              <circle cx="10" cy="8" r="2" />
            </svg>
            {item.destination}
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-1.5 text-[12px] text-white/40">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="3" width="16" height="15" rx="2" />
            <path d="M6 1v4M14 1v4M2 8h16" strokeLinecap="round" />
          </svg>
          {item.dates}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[12px] text-white/35">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4l3 3" strokeLinecap="round" />
            </svg>
            {item.days} days
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" />
            </svg>
            {item.places} places
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.05] text-white/40 border border-gray-100 dark:border-white/[0.06]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer action */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onView(item.id)}
          className="w-full py-2 rounded-xl text-[13px] font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-150"
        >
          View itinerary →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

export default function Itineraries() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");

  // Handler for Topbar search
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  // Filtering logic: status + search (title, destination, tags)
  const filtered = MOCK.filter((item) => {
    const matchesStatus = filter === "all" || item.status === filter;
    if (!matchesStatus) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.destination.toLowerCase().includes(q) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const counts = {
    all: MOCK.length,
    planned: MOCK.filter((i) => i.status === "planned").length,
    ongoing: MOCK.filter((i) => i.status === "ongoing").length,
    completed: MOCK.filter((i) => i.status === "completed").length,
  };

  const totalDays = MOCK.reduce((s, i) => s + i.days, 0);
  const totalPlaces = MOCK.reduce((s, i) => s + i.places, 0);

  return (
    <AppLayout onSearch={handleSearch}>
      <div className="max-w-[1200px] mx-auto px-5 py-6 space-y-6">
        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-white leading-tight">My Itineraries</h1>
            <p className="text-[13px] text-white/40 mt-1">
              Plan, track, and revisit all your travel itineraries in one place.
            </p>
          </div>

          <button
            onClick={() => navigate("/itineraries/new")}
            className="flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[13px] font-semibold text-black transition-all duration-150 shadow-lg shadow-emerald-500/20 active:scale-[0.98] whitespace-nowrap"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="10" y1="4" x2="10" y2="16" />
              <line x1="4" y1="10" x2="16" y2="10" />
            </svg>
            New itinerary
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="flex flex-wrap gap-3">
          <StatPill label="Total trips" value={MOCK.length} accent="text-gray-900 dark:text-white" />
          <StatPill label="Days planned" value={totalDays} accent="text-emerald-400" />
          <StatPill label="Places saved" value={totalPlaces} accent="text-blue-400" />
          <StatPill label="Ongoing" value={counts.ongoing} accent="text-emerald-300" />
        </div>

        {/* ── Filters + search ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all duration-150 ${
                  filter === f
                    ? "bg-emerald-500 text-black shadow-sm shadow-emerald-500/30"
                    : "text-gray-400 dark:text-white/40 hover:text-white/70"
                }`}
              >
                {f} ({counts[f]})
              </button>
            ))}
          </div>
          {/* No local search bar, search is global via Topbar */}
        </div>

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <ItineraryCard
                key={item.id}
                item={item}
                onView={(id) => navigate(`/itineraries/${id}`)}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] flex items-center justify-center text-3xl">
              🗺️
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white/60">No itineraries found</p>
              <p className="text-[13px] text-white/30 mt-1">
                {search.trim()
                  ? `No results match "${search}"`
                  : "Create your first trip to get started"}
              </p>
            </div>
            <button
              onClick={() => navigate("/itineraries/new")}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-semibold hover:bg-emerald-500/20 transition-all"
            >
              + Create itinerary
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
