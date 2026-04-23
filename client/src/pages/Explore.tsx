import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Category = "all" | "beaches" | "cities" | "mountains" | "culture" | "food";

interface Place {
  id: number;
  name: string;
  country: string;
  category: Exclude<Category, "all">;
  rating: number;
  reviews: number;
  cover: string;
  tags: string[];
  description: string;
  trending: boolean;
}

/* ─────────────────────────────────────────────
   Mock data
───────────────────────────────────────────── */
const PLACES: Place[] = [
  {
    id: 1,
    name: "Santorini",
    country: "Greece",
    category: "beaches",
    rating: 4.9,
    reviews: 12400,
    cover: "🏝️",
    tags: ["Romantic", "Scenic", "Island"],
    description: "Iconic white-washed villages perched on volcanic cliffs above a stunning caldera.",
    trending: true,
  },
  {
    id: 2,
    name: "Kyoto",
    country: "Japan",
    category: "culture",
    rating: 4.8,
    reviews: 9800,
    cover: "⛩️",
    tags: ["Temples", "Gardens", "History"],
    description: "Ancient imperial capital filled with traditional temples, geisha districts and bamboo forests.",
    trending: true,
  },
  {
    id: 3,
    name: "Machu Picchu",
    country: "Peru",
    category: "mountains",
    rating: 4.9,
    reviews: 8300,
    cover: "🏔️",
    tags: ["UNESCO", "Inca", "Hiking"],
    description: "Mysterious Inca citadel set high in the Andes mountains surrounded by mist.",
    trending: false,
  },
  {
    id: 4,
    name: "New York City",
    country: "USA",
    category: "cities",
    rating: 4.7,
    reviews: 24100,
    cover: "🗽",
    tags: ["Skyline", "Culture", "Shopping"],
    description: "The city that never sleeps — iconic skyline, world-class dining and endless culture.",
    trending: true,
  },
  {
    id: 5,
    name: "Amalfi Coast",
    country: "Italy",
    category: "beaches",
    rating: 4.8,
    reviews: 7600,
    cover: "🌊",
    tags: ["Scenic Drive", "Villages", "Sea"],
    description: "Dramatic cliffside villages cascading down to a sparkling turquoise sea.",
    trending: false,
  },
  {
    id: 6,
    name: "Tokyo",
    country: "Japan",
    category: "cities",
    rating: 4.9,
    reviews: 31200,
    cover: "🗼",
    tags: ["Tech", "Food", "Nightlife"],
    description: "A dazzling blend of ultramodern skyscrapers, traditional shrines and world-renowned cuisine.",
    trending: true,
  },
  {
    id: 7,
    name: "Patagonia",
    country: "Argentina",
    category: "mountains",
    rating: 4.8,
    reviews: 5400,
    cover: "🏞️",
    tags: ["Wilderness", "Trekking", "Wildlife"],
    description: "Vast untamed wilderness at the end of the world with jagged peaks and glaciers.",
    trending: false,
  },
  {
    id: 8,
    name: "Bangkok",
    country: "Thailand",
    category: "food",
    rating: 4.7,
    reviews: 18900,
    cover: "🍜",
    tags: ["Street Food", "Temples", "Markets"],
    description: "A sensory explosion of incredible street food, ornate temples and buzzing night markets.",
    trending: true,
  },
  {
    id: 9,
    name: "Marrakech",
    country: "Morocco",
    category: "culture",
    rating: 4.6,
    reviews: 6700,
    cover: "🕌",
    tags: ["Souks", "Riads", "Spices"],
    description: "A labyrinthine medina packed with colourful souks, ornate palaces and rooftop cafés.",
    trending: false,
  },
  {
    id: 10,
    name: "Maldives",
    country: "Maldives",
    category: "beaches",
    rating: 4.9,
    reviews: 11300,
    cover: "🐠",
    tags: ["Overwater Bungalows", "Coral", "Luxury"],
    description: "Crystal-clear lagoons, overwater bungalows and some of the world's best snorkelling.",
    trending: true,
  },
  {
    id: 11,
    name: "Barcelona",
    country: "Spain",
    category: "cities",
    rating: 4.8,
    reviews: 21500,
    cover: "🏟️",
    tags: ["Architecture", "Beach", "Tapas"],
    description: "Gaudí's fantastical architecture, vibrant beach culture and unbeatable tapas scene.",
    trending: false,
  },
  {
    id: 12,
    name: "Tuscany",
    country: "Italy",
    category: "food",
    rating: 4.8,
    reviews: 9100,
    cover: "🍷",
    tags: ["Wine", "Countryside", "Cuisine"],
    description: "Rolling hills, cypress-lined roads, ancient hilltop towns and Italy's finest wines.",
    trending: false,
  },
];

const CATEGORIES: Array<{ key: Category; label: string; emoji: string }> = [
  { key: "all", label: "All", emoji: "🌍" },
  { key: "beaches", label: "Beaches", emoji: "🏖️" },
  { key: "cities", label: "Cities", emoji: "🏙️" },
  { key: "mountains", label: "Mountains", emoji: "⛰️" },
  { key: "culture", label: "Culture", emoji: "🏛️" },
  { key: "food", label: "Food & Drink", emoji: "🍽️" },
];

const SORT_OPTIONS = ["Trending", "Top Rated", "Most Reviewed"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

/* ─────────────────────────────────────────────
   Star rating display
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
   Place card
───────────────────────────────────────────── */
function PlaceCard({ place, onExplore }: { place: Place; onExplore: (id: number) => void }) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="group flex flex-col bg-white dark:bg-[#0b1528] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden hover:border-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-200 cursor-pointer">
      {/* Cover */}
      <div className="relative h-36 bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.05] dark:to-white/[0.01] flex items-center justify-center text-6xl select-none border-b border-gray-100 dark:border-white/[0.06]">
        {place.cover}

        {/* Trending badge */}
        {place.trending && (
          <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold bg-orange-500/90 text-white px-2 py-0.5 rounded-full">
            🔥 Trending
          </span>
        )}

        {/* Bookmark */}
        <button
          onClick={(e) => { e.stopPropagation(); setBookmarked((v) => !v); }}
          className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-150 ${
            bookmarked
              ? "bg-emerald-500 border-emerald-400 text-white"
              : "bg-black/40 border-gray-200 dark:border-white/10 text-white/40 hover:text-white hover:border-white/30"
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
            <path d="M5 3h10a1 1 0 011 1v13l-6-4-6 4V4a1 1 0 011-1z" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1" onClick={() => onExplore(place.id)}>
        {/* Name + country */}
        <div>
          <h3 className="text-[14px] font-semibold text-white group-hover:text-emerald-300 transition-colors leading-snug">
            {place.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-[12px] text-white/40">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" />
              <circle cx="10" cy="8" r="2" />
            </svg>
            {place.country}
          </div>
        </div>

        {/* Description */}
        <p className="text-[12px] text-gray-400 dark:text-white/35 leading-relaxed line-clamp-2 flex-1">
          {place.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <Stars rating={place.rating} />
          <span className="text-[12px] font-semibold text-amber-400">{place.rating}</span>
          <span className="text-[11px] text-white/25">({place.reviews.toLocaleString()})</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {place.tags.map((tag) => (
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
      <div className="px-4 pb-4">
        <button
          onClick={() => onExplore(place.id)}
          className="w-full py-2 rounded-xl text-[13px] font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-150"
        >
          Explore →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function Explore() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<SortOption>("Trending");
  const [search, setSearch] = useState("");

  const filtered = PLACES.filter((p) => {
    const matchesCat = category === "all" || p.category === category;
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  }).sort((a, b) => {
    if (sort === "Trending") return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
    if (sort === "Top Rated") return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto px-5 py-6 space-y-6">

        {/* ── Hero banner ── */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900/40 via-[#0b1528] to-blue-900/30 border border-gray-200 dark:border-white/[0.07] px-6 py-8">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-emerald-400 uppercase mb-1">
                Discover the world
              </p>
              <h1 className="text-[26px] font-bold text-white leading-tight">
                Explore destinations
              </h1>
              <p className="text-[13px] text-white/45 mt-1.5 max-w-md">
                Browse hand-picked destinations across the globe. Find inspiration for your next adventure.
              </p>
            </div>

            <button
              onClick={() => navigate("/finder")}
              className="flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[13px] font-semibold text-black transition-all duration-150 shadow-lg shadow-emerald-500/25 active:scale-[0.98] whitespace-nowrap"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="9" cy="9" r="6" /><path d="M15 15l3 3" />
              </svg>
              Open Finder
            </button>
          </div>

          {/* Quick stats */}
          <div className="relative z-10 flex flex-wrap gap-6 mt-6">
            {[
              { label: "Destinations", value: "500+" },
              { label: "Countries", value: "80+" },
              { label: "Traveller reviews", value: "1.2M+" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[18px] font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-[11px] text-white/35">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Category pills ── */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-150 ${
                category === key
                  ? "bg-emerald-500 border-emerald-400 text-black shadow-sm shadow-emerald-500/30"
                  : "bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.07] text-white/50 hover:text-white/80 hover:border-gray-300 dark:hover:border-white/15"
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {/* ── Search + Sort ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl px-3.5 h-[42px] focus-within:border-emerald-500/40 transition-colors">
            <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6" /><path d="M15 15l3 3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search destinations, countries, tags…"
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

          {/* Sort */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl p-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setSort(opt)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 whitespace-nowrap ${
                  sort === opt
                    ? "bg-emerald-500 text-black shadow-sm shadow-emerald-500/30"
                    : "text-gray-400 dark:text-white/40 hover:text-white/70"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-white/35">
            <span className="text-gray-700 dark:text-white/70 font-semibold">{filtered.length}</span> destinations found
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

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onExplore={(id) => navigate(`/explore/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] flex items-center justify-center text-3xl">
              🌐
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white/60">No destinations found</p>
              <p className="text-[13px] text-white/30 mt-1">Try a different search or category</p>
            </div>
            <button
              onClick={() => { setCategory("all"); setSearch(""); }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-semibold hover:bg-emerald-500/20 transition-all"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
