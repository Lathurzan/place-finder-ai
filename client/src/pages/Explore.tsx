import { useState, useEffect } from "react";
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
  reviews?: number;
  review_count?: number;
  cover: string;
  tags?: string[];
  description: string;
  trending: boolean;
  image_url?: string;
}

/* ─────────────────────────────────────────────

  // Handler for top bar search
  const handleTopBarSearch = (q: string) => {
    setSearch(q);
  };
   Mock data
───────────────────────────────────────────── */
// Dynamic places state
const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// Helper to resolve image URLs
const getImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  // If already contains /static/ (backend already prepended), don't double-prepend
  if (url.startsWith("/static/") || url.includes("/static/")) {
    return `${API_BASE}${url.startsWith("/") ? url : "/" + url}`;
  }
  return `${API_BASE}/static/${url.replace(/^\/+/, "")}`;
};

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

// DB-persistent bookmark hook
function useBookmark(place: Place) {
  const [bookmarked,  setBookmarked]  = useState(false);
  const [bookmarkId,  setBookmarkId]  = useState<number | null>(null);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/bookmarks/check/${place.id}?user_id=1`)
      .then((r) => r.json())
      .then((data) => {
        setBookmarked(data.bookmarked);
        setBookmarkId(data.bookmark_id ?? null);
      })
      .catch(() => {});
  }, [place.id]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    try {
      if (bookmarked && bookmarkId) {
        // Remove
        const res = await fetch(
          `${API_BASE}/api/bookmarks/${bookmarkId}?user_id=1`,
          { method: "DELETE" }
        );
        if (res.ok) { setBookmarked(false); setBookmarkId(null); }
      } else {
        // Add
        const res = await fetch(`${API_BASE}/api/bookmarks?user_id=1`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ place_id: place.id, place }),
        });
        const data = await res.json();
        if (data.bookmark?.id) {
          setBookmarked(true);
          setBookmarkId(data.bookmark.id);
        } else if (data.already_exists) {
          setBookmarked(true);
        }
      }
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  };

  return { bookmarked, saving, toggle };
}

// Updated PlaceCard with DB-persistent bookmark
function PlaceCard({ place, onExplore }: { place: Place; onExplore: (id: number) => void }) {
  const { bookmarked, saving, toggle } = useBookmark(place);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col bg-white dark:bg-[#0b1528] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden hover:border-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-200 cursor-pointer">
      <div className="relative h-36 bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.05] dark:to-white/[0.01] flex items-center justify-center select-none border-b border-gray-100 dark:border-white/[0.06]">
        {place.image_url && !imgError ? (
          <img
            src={getImageUrl(place.image_url)}
            alt={place.name}
            className="object-cover w-full h-full absolute inset-0"
            loading="lazy"
            onError={(e) => {
              setImgError(true);
              // Optionally, set a fallback src
              if (e.currentTarget) {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '';
              }
            }}
          />
        ) : (
          <span className="text-6xl z-10">{place.cover || "📍"}</span>
        )}
        {place.image_url && !imgError && (
          <span className="absolute left-3 bottom-3 text-2xl z-10 drop-shadow-lg">{place.cover || "📍"}</span>
        )}
        {place.trending && (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1 text-[10px] font-bold bg-orange-500/90 text-white px-2 py-0.5 rounded-full">
            Trending
          </span>
        )}
        {/* Bookmark button — saves to DB */}
        <button
          onClick={toggle}
          disabled={saving}
          className={`absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-150 ${
            bookmarked
              ? "bg-emerald-500 border-emerald-400 text-white"
              : "bg-black/40 border-white/10 text-white/40 hover:text-white hover:border-white/30"
          } ${saving ? "opacity-50 cursor-wait" : ""}`}
          title={bookmarked ? "Remove bookmark" : "Save bookmark"}
        >
          {saving ? (
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                strokeDasharray="31.4 31.4" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20"
              fill={bookmarked ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="1.8">
              <path d="M5 3h10a1 1 0 011 1v13l-6-4-6 4V4a1 1 0 011-1z" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Body — unchanged from your existing Explore.tsx */}
      <div className="flex flex-col gap-2 p-4 flex-1" onClick={() => onExplore(place.id)}>
        <div>
          <h3 className="text-[14px] font-semibold text-white group-hover:text-emerald-300 transition-colors leading-snug">{place.name}</h3>
          <div className="flex items-center gap-1 mt-0.5 text-[12px] text-white/40">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z"/>
              <circle cx="10" cy="8" r="2"/>
            </svg>
            {place.country}
          </div>
        </div>
        <p className="text-[12px] text-white/35 leading-relaxed line-clamp-2 flex-1">{place.description}</p>
        <div className="flex items-center gap-2">
          <Stars rating={place.rating}/>
          <span className="text-[12px] font-semibold text-amber-400">{place.rating}</span>
          <span className="text-[11px] text-white/25">({(place.reviews ?? place.review_count ?? 0).toLocaleString()})</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(place.tags ?? []).map((tag) => (
            <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.05] text-white/35 border border-white/[0.06]">{tag}</span>
          ))}
        </div>
      </div>
      <div className="px-4 pb-4">
        <button onClick={() => onExplore(place.id)}
          className="w-full py-2 rounded-xl text-[13px] font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all">
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
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Recommendations modal state
  const [showRecsModal, setShowRecsModal] = useState(false);
  const [recs, setRecs] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);

  const openRecommendationsModal = async () => {
    setShowRecsModal(true);
    if (recs.length > 0 || recsLoading) return;
    setRecsLoading(true);
    setRecsError(null);
    try {
      const res = await fetch(`${API_BASE}/api/ml/recommendations-csv?top_n=9`);
      if (!res.ok) throw new Error(`ML API ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data.recommendations) ? data.recommendations : [];
      const sanitized = list.map((it: any) => ({
        id: it.id ?? it.row_id ?? null,
        name: it.name ?? it.title ?? String(it.name ?? it["name"] ?? "Unknown"),
        description: it.description ?? it.summary ?? "",
        image: it.col_13 ?? it.image_url ?? null,
        similarity: Number.isFinite(+it.similarity) ? +it.similarity : null,
      }));
      setRecs(sanitized);
    } catch (err: any) {
      setRecsError(err?.message || "Failed to load recommendations");
      setRecs([]);
    } finally {
      setRecsLoading(false);
    }
  };

  // Handler for Topbar search
  const handleTopBarSearch = (q: string) => {
    setSearch(q);
  };

  // Fetch places from backend
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.append("search", search.trim());
        if (category !== "all") params.append("category", category);
        if (sort) params.append("sort", sort);
        const res = await fetch(`${API_BASE}/api/places/explore?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch places");
        const data = await res.json();
        setPlaces(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch places");
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [search, category, sort]);

  // No local filtering, use backend results

  return (
    <AppLayout onSearch={handleTopBarSearch}>
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
              onClick={() => openRecommendationsModal()}
              className="flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[13px] font-semibold text-black transition-all duration-150 shadow-lg shadow-emerald-500/25 active:scale-[0.98] whitespace-nowrap"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="9" cy="9" r="6" /><path d="M15 15l3 3" />
              </svg>
              Recommended for you
            </button>
          </div>
          {/* Recommendations modal (opens when user clicks the button) */}
          {showRecsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRecsModal(false)} />

              <div className="relative z-10 w-full max-w-4xl mx-auto bg-white dark:bg-[#061826] rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.04]">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recommended for you</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personalized picks based on your recent searches and bookmarks.</p>
                  </div>
                  <div className="ml-4 flex items-start">
                    <button
                      aria-label="Close recommendations"
                      onClick={() => setShowRecsModal(false)}
                      className="w-9 h-9 rounded-full bg-white dark:bg-[#0b1528] flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 shadow-sm border border-gray-100 dark:border-white/[0.04]"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-auto">
                  {recsLoading && <div className="text-gray-500">Loading…</div>}
                  {recsError && <div className="text-red-500">{recsError}</div>}
                  {!recsLoading && !recsError && recs.length === 0 && (
                    <div className="text-gray-600 text-center py-10">No recommendations available.</div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {recs.map((r) => (
                      <div key={r.id ?? r.name} className="bg-white dark:bg-[#041226] border border-gray-100 dark:border-white/[0.04] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full h-40 bg-gray-100 dark:bg-white/5 overflow-hidden">
                          {r.image ? (
                            <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">📍</div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{r.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.description}</div>
                            </div>
                            <div className="text-sm text-gray-400 ml-2">{r.similarity ? `${(r.similarity * 100).toFixed(0)}%` : ''}</div>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <button
                              onClick={() => { setShowRecsModal(false); if (r.id && Number(r.id)) navigate(`/explore/${r.id}`); else navigate('/finder'); }}
                              className="px-3 py-1 rounded-md bg-emerald-500 text-white text-sm font-medium"
                            >
                              Explore
                            </button>
                            <button
                              onClick={() => { try { navigator.clipboard?.writeText(JSON.stringify(r)); } catch {} }}
                              className="px-3 py-1 rounded-md bg-gray-50 dark:bg-white/5 text-sm"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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

        {/* ── Sort only (search bar removed) ── */}
        <div className="flex flex-col sm:flex-row gap-3">
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
            <span className="text-gray-700 dark:text-white/70 font-semibold">{places.length}</span> destinations found
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] flex items-center justify-center text-3xl animate-pulse">
              🌐
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white/60">Loading destinations…</p>
              <p className="text-[13px] text-white/30 mt-1">Please wait</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-3xl">
              ❌
            </div>
            <div>
              <p className="text-[15px] font-semibold text-red-500 dark:text-red-400">{error}</p>
              <p className="text-[13px] text-white/30 mt-1">Try a different search or category</p>
            </div>
            <button
              onClick={() => { setCategory("all"); setSearch(""); }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-semibold hover:bg-emerald-500/20 transition-all"
            >
              Clear filters
            </button>
          </div>
        ) : places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {places.map((place) => (
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
