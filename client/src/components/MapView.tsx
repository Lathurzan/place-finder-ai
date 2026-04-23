import { useState } from "react";
import SearchBar from "../components/SearchBar";

const API_BASE = "http://127.0.0.1:8000";

interface PlaceResult {
  name: string;
  lat: number;
  lon: number;
}

export default function MapView() {
  const [query, setQuery]       = useState<string>("");
  const [results, setResults]   = useState<PlaceResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [selected, setSelected] = useState<PlaceResult | null>(null);

  const handleSearch = async (q: string) => {
    setQuery(q);
    setError(null);
    setLoading(true);
    try {
      // GET /api/places/search-multiple?q=...
      const res = await fetch(
        `${API_BASE}/api/places/search-multiple?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: PlaceResult[] = await res.json();
      setResults(data);
      if (data.length > 0) setSelected(data[0]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-[#060c18] text-white">

      {/* LEFT SIDEBAR */}
      <div className="w-[380px] border-r border-gray-200 dark:border-white/10 flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10">
          <h1 className="text-lg font-bold">Place Finder AI</h1>
          <p className="text-xs text-gray-400">
            Discover places on the map
          </p>
        </div>

        {/* Search */}
        <div className="p-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 px-4 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] text-gray-500">
            {loading ? "searching…" : results.length > 0 ? `${results.length} results` : "results"}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Error */}
        {error && (
          <p className="mx-4 text-xs text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">

          {/* Loading skeleton */}
          {loading && [1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c1626] animate-pulse h-20" />
          ))}

          {/* Empty state */}
          {!loading && results.length === 0 && query && (
            <p className="text-xs text-gray-500 text-center mt-6">No results for "{query}"</p>
          )}

          {/* Real results from API */}
          {!loading && results.map((place, idx) => (
            <div
              key={idx}
              onClick={() => setSelected(place)}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                selected?.name === place.name
                  ? "border-emerald-400 bg-emerald-400/10"
                  : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c1626] hover:border-emerald-400/40"
              }`}
            >
              <h3 className="text-sm font-semibold line-clamp-1">{place.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative">

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          
          <div className="bg-white dark:bg-[#0c1626]/80 backdrop-blur border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm">
            📍 Live Map View
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-white dark:bg-[#0c1626]/80 border border-gray-200 dark:border-white/10 text-xs">
              Filters
            </button>
            <button className="px-4 py-2 rounded-xl bg-emerald-400 text-[#022c22] text-xs font-semibold">
              My Location
            </button>
          </div>
        </div>

        {/* MAP PLACEHOLDER */}
        <div className="w-full h-full bg-gradient-to-br from-[#0c1626] via-[#111f35] to-[#060c18] flex items-center justify-center">

          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-xl font-bold mb-2">
              Map Coming Here
            </h2>
            <p className="text-sm text-gray-400">
              Integrate Leaflet / Google Maps / Mapbox here
            </p>
          </div>

        </div>

        {/* Floating action card */}
        <div className="absolute bottom-6 left-6 bg-white dark:bg-[#0c1626]/90 border border-gray-200 dark:border-white/10 p-4 rounded-2xl backdrop-blur w-[260px]">
          <h3 className="text-sm font-semibold">AI Suggestion</h3>
          <p className="text-xs text-gray-400 mt-1">
            “Best beaches near you are showing high ratings today.”
          </p>

          <button className="mt-3 w-full py-2 rounded-xl bg-emerald-400 text-[#022c22] text-xs font-semibold">
            Explore Now
          </button>
        </div>

      </div>
    </div>
  );
}
