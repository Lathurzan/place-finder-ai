import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type BookmarkCategory = "all" | "places" | "itineraries" | "hotels" | "restaurants";

interface Bookmark {
  id: number;
  type: Exclude<BookmarkCategory, "all">;
  name: string;
  location: string;
  cover: string;
  savedOn: string;
  rating: number;
  tags: string[];
  note?: string;
}

/* ─────────────────────────────────────────────
   Mock data
───────────────────────────────────────────── */
const BOOKMARKS: Bookmark[] = [
  {
    id: 1,
    type: "places",
    name: "Fushimi Inari Taisha",
    location: "Kyoto, Japan",
    cover: "⛩️",
    savedOn: "Apr 20, 2026",
    rating: 4.9,
    tags: ["Shrine", "Hiking", "Photography"],
    note: "Visit at sunrise to avoid crowds.",
  },
  {
    id: 2,
    type: "itineraries",
    name: "Tokyo & Kyoto Spring",
    location: "Japan",
    cover: "🗾",
    savedOn: "Apr 18, 2026",
    rating: 4.8,
    tags: ["11 Days", "Culture", "Food"],
  },
  {
    id: 3,
    type: "hotels",
    name: "Aman Tokyo",
    location: "Tokyo, Japan",
    cover: "🏨",
    savedOn: "Apr 15, 2026",
    rating: 4.9,
    tags: ["Luxury", "City View", "Spa"],
    note: "Book the corner suite — views are incredible.",
  },
  {
    id: 4,
    type: "restaurants",
    name: "Sukiyabashi Jiro",
    location: "Tokyo, Japan",
    cover: "🍣",
    savedOn: "Apr 12, 2026",
    rating: 5.0,
    tags: ["Sushi", "Michelin", "Omakase"],
    note: "Reserve 2 months in advance.",
  },
  {
    id: 5,
    type: "places",
    name: "Santorini Caldera",
    location: "Santorini, Greece",
    cover: "🏝️",
    savedOn: "Apr 10, 2026",
    rating: 4.9,
    tags: ["Scenic", "Sunset", "Island"],
  },
  {
    id: 6,
    type: "places",
    name: "Machu Picchu",
    location: "Cusco, Peru",
    cover: "🏔️",
    savedOn: "Apr 8, 2026",
    rating: 4.9,
    tags: ["UNESCO", "Inca", "Hiking"],
    note: "Get the early morning entry ticket.",
  },
  {
    id: 7,
    type: "itineraries",
    name: "Santorini Getaway",
    location: "Greece",
    cover: "🌊",
    savedOn: "Apr 5, 2026",
    rating: 4.7,
    tags: ["7 Days", "Beach", "Romance"],
  },
  {
    id: 8,
    type: "hotels",
    name: "Katikies Hotel",
    location: "Santorini, Greece",
    cover: "🌅",
    savedOn: "Apr 3, 2026",
    rating: 4.8,
    tags: ["Cliffside", "Pool", "Views"],
  },
  {
    id: 9,
    type: "restaurants",
    name: "Noma",
    location: "Copenhagen, Denmark",
    cover: "🍽️",
    savedOn: "Mar 28, 2026",
    rating: 4.9,
    tags: ["Nordic", "Tasting Menu", "Seasonal"],
    note: "Opens reservations on the 1st of each month.",
  },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const CATEGORIES: Array<{ key: BookmarkCategory; label: string; emoji: string }> = [
  { key: "all", label: "All", emoji: "🔖" },
  { key: "places", label: "Places", emoji: "📍" },
  { key: "itineraries", label: "Itineraries", emoji: "📋" },
  { key: "hotels", label: "Hotels", emoji: "🏨" },
  { key: "restaurants", label: "Restaurants", emoji: "🍽️" },
];

const TYPE_STYLES: Record<Exclude<BookmarkCategory, "all">, string> = {
  places: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  itineraries: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  hotels: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  restaurants: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const TYPE_ICONS: Record<Exclude<BookmarkCategory, "all">, string> = {
  places: "📍",
  itineraries: "📋",
  hotels: "🏨",
  restaurants: "🍽️",
};

/* ─────────────────────────────────────────────
   Star rating
───────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200 dark:text-white/15"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118L10 14.347l-3.37 2.449c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.744 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
        </svg>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Bookmark Card
───────────────────────────────────────────── */
function BookmarkCard({
  item,
  onRemove,
}: {
  item: Bookmark;
  onRemove: (id: number) => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <div className="group flex flex-col bg-white dark:bg-[#0b1528] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden hover:border-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200">
      {/* Cover */}
      <div className="relative h-28 bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.05] dark:to-white/[0.01] flex items-center justify-center text-5xl select-none border-b border-gray-100 dark:border-white/[0.06]">
        {item.cover}

        {/* Type badge */}
        <span className={`absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${TYPE_STYLES[item.type]}`}>
          {TYPE_ICONS[item.type]} {item.type}
        </span>

        {/* Remove button */}
        <button
          onClick={() => setConfirmRemove(true)}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 border border-gray-200 dark:border-white/10 text-white/30 hover:text-rose-400 hover:border-rose-400/40 hover:bg-rose-500/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
          title="Remove bookmark"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Name + location */}
        <div>
          <h3 className="text-[14px] font-semibold text-white group-hover:text-emerald-300 transition-colors leading-snug">
            {item.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-[12px] text-white/40">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" />
              <circle cx="10" cy="8" r="2" />
            </svg>
            {item.location}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <Stars rating={item.rating} />
          <span className="text-[12px] font-semibold text-amber-400">{item.rating.toFixed(1)}</span>
        </div>

        {/* Note */}
        {item.note && (
          <div className="flex items-start gap-1.5 bg-amber-500/5 border border-amber-500/15 rounded-lg px-2.5 py-2">
            <svg className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
            </svg>
            <p className="text-[11px] text-amber-300/70 leading-relaxed">{item.note}</p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-white/35 border border-gray-100 dark:border-white/[0.06]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] text-white/25">
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="3" width="16" height="15" rx="2" />
            <path d="M6 1v4M14 1v4M2 8h16" strokeLinecap="round" />
          </svg>
          {item.savedOn}
        </span>

        {confirmRemove ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/40">Remove?</span>
            <button
              onClick={() => onRemove(item.id)}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className="text-[11px] font-semibold text-white/30 hover:text-white/60 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            View →
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function Bookmarks() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Bookmark[]>(BOOKMARKS);
  const [category, setCategory] = useState<BookmarkCategory>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = items.filter((b) => {
    const matchesCat = category === "all" || b.type === category;
    const matchesSearch =
      search === "" ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleRemove = (id: number) => setItems((prev) => prev.filter((b) => b.id !== id));

  const counts = {
    all: items.length,
    places: items.filter((b) => b.type === "places").length,
    itineraries: items.filter((b) => b.type === "itineraries").length,
    hotels: items.filter((b) => b.type === "hotels").length,
    restaurants: items.filter((b) => b.type === "restaurants").length,
  };

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto px-5 py-6 space-y-6">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-white leading-tight">Bookmarks</h1>
            <p className="text-[13px] text-white/40 mt-1">
              All your saved places, itineraries, hotels and restaurants in one place.
            </p>
          </div>
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[13px] font-semibold text-black transition-all duration-150 shadow-lg shadow-emerald-500/20 active:scale-[0.98] whitespace-nowrap"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 2a12 12 0 010 16M2 10h16" />
            </svg>
            Explore more
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["places", "itineraries", "hotels", "restaurants"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setCategory(type)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-150 text-left ${
                category === type
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/15"
              }`}
            >
              <span className="text-2xl">{TYPE_ICONS[type]}</span>
              <div>
                <div className="text-[18px] font-bold text-gray-900 dark:text-white">{counts[type]}</div>
                <div className="text-[11px] text-gray-400 dark:text-white/35 capitalize">{type}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Filters + search + view toggle ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category pills */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl p-1 overflow-x-auto">
            {CATEGORIES.map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ${
                  category === key
                    ? "bg-emerald-500 text-black shadow-sm shadow-emerald-500/30"
                    : "text-gray-400 dark:text-white/40 hover:text-white/70"
                }`}
              >
                <span>{emoji}</span>
                {label}
                <span className={`text-[10px] ${category === key ? "text-black/60" : "text-gray-400 dark:text-white/25"}`}>
                  ({counts[key]})
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl px-3.5 h-[42px] focus-within:border-emerald-500/40 transition-colors">
            <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6" /><path d="M15 15l3 3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search bookmarks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-white/80 placeholder-white/25"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 dark:text-white/25 hover:text-white/60 transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 4l12 12M16 4L4 16" />
                </svg>
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl p-1">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-2 rounded-lg transition-all duration-150 ${
                  view === v ? "bg-emerald-500 text-black" : "text-white/35 hover:text-white/60"
                }`}
              >
                {v === "grid" ? (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="2" y="2" width="7" height="7" rx="1" opacity=".9" />
                    <rect x="11" y="2" width="7" height="7" rx="1" opacity=".9" />
                    <rect x="2" y="11" width="7" height="7" rx="1" opacity=".9" />
                    <rect x="11" y="11" width="7" height="7" rx="1" opacity=".9" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M4 5h12M4 10h12M4 15h12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-white/35">
            <span className="text-gray-700 dark:text-white/70 font-semibold">{filtered.length}</span> bookmarks
          </p>
          {(category !== "all" || search) && (
            <button
              onClick={() => { setCategory("all"); setSearch(""); }}
              className="text-[12px] text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {filtered.length > 0 ? (
          view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <BookmarkCard key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </div>
          ) : (
            /* List view */
            <div className="flex flex-col gap-2">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-4 bg-white dark:bg-[#0b1528] border border-gray-200 dark:border-white/[0.07] rounded-xl px-4 py-3 hover:border-emerald-500/25 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center text-2xl flex-shrink-0">
                    {item.cover}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${TYPE_STYLES[item.type]}`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[12px] text-white/35">{item.location}</span>
                      <Stars rating={item.rating} />
                      <span className="text-[11px] text-amber-400 font-semibold">{item.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="hidden sm:block text-[11px] text-white/25">{item.savedOn}</span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M5 5l10 10M15 5L5 15" />
                      </svg>
                    </button>
                    <button className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] flex items-center justify-center text-3xl">
              🔖
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white/60">No bookmarks found</p>
              <p className="text-[13px] text-white/30 mt-1">
                {search ? "Try a different search term" : "Start exploring and save places you love"}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => navigate("/explore")}
                className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-semibold hover:bg-emerald-500/20 transition-all"
              >
                Explore destinations
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
