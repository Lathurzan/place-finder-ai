import { useState } from "react";
import SearchBar from "../components/SearchBar";

export default function MapView() {
  const [query, setQuery] = useState("");

  return (
    <div className="h-screen w-full flex bg-[#060c18] text-white">

      {/* LEFT SIDEBAR */}
      <div className="w-[380px] border-r border-white/10 flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <h1 className="text-lg font-bold">Place Finder AI</h1>
          <p className="text-xs text-gray-400">
            Discover places on the map
          </p>
        </div>

        {/* Search */}
        <div className="p-4">
          <SearchBar onSearch={(q) => setQuery(q)} />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 px-4 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] text-gray-500">results</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">

          {/* Result Card */}
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="p-3 rounded-xl border border-white/10 bg-[#0c1626] hover:border-emerald-400/40 transition cursor-pointer"
            >
              <h3 className="text-sm font-semibold">
                Beach Location {item}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Beautiful destination with AI suggestion
              </p>

              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>⭐ 4.8</span>
                <span>2.3 km</span>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative">

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          
          <div className="bg-[#0c1626]/80 backdrop-blur border border-white/10 px-4 py-2 rounded-xl text-sm">
            📍 Live Map View
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-[#0c1626]/80 border border-white/10 text-xs">
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
        <div className="absolute bottom-6 left-6 bg-[#0c1626]/90 border border-white/10 p-4 rounded-2xl backdrop-blur w-[260px]">
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
