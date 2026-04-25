// src/pages/MapView.tsx
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SearchBar from "../components/SearchBar";

// Fix Leaflet default marker icons (Vite asset issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

interface PlaceResult {
  name: string;
  lat:  number;
  lon:  number;
}

/* Moves the map centre whenever `selected` changes */
function FlyTo({ place }: { place: PlaceResult | null }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.flyTo([place.lat, place.lon], 13, { duration: 1.2 });
  }, [place, map]);
  return null;
}


export default function MapView() {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<PlaceResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [selected, setSelected] = useState<PlaceResult | null>(null);
  const [listening, setListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);


  // Text search
  const handleSearch = async (q: string) => {
    setQuery(q);
    setError(null);
    setLoading(true);
    setImagePreview(null); // Clear image preview on text search
    try {
      const res = await fetch(
        `${API_BASE}/api/places/search-multiple?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: PlaceResult[] = await res.json();
      if (!Array.isArray(data) || data.length === 0)
        throw new Error("No results found");
      setResults(data);
      setSelected(data[0]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Image search handler
  const handleImageSearch = (file: File) => {
    setError(null);
    setLoading(true);
    // Show preview
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string);
      setImagePreview(base64);
      try {
        const res = await fetch(`${API_BASE}/api/ai/analyze-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_data: base64.split(",").pop(), mime_type: file.type }),
        });
        let errorMsg = "Image search failed";
        if (!res.ok) {
          // Try to extract error message from backend
          try {
            const errData = await res.json();
            if (errData.detail && typeof errData.detail === "string") {
              errorMsg = errData.detail;
            }
          } catch {}
          throw new Error(errorMsg);
        }
        const data = await res.json();
        const placeName = data.response || data.result || data.place || "";
        if (!placeName) throw new Error("AI could not identify the place");
        await handleSearch(placeName);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Server unavailable. Please try again later." : err.message || "Image search failed");
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };



  // Voice search
  const handleVoiceSearch = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setPartialTranscript("");
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice search not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i][0];
        if (event.results[i].isFinal) {
          final += res.transcript;
        } else {
          interim += res.transcript;
        }
      }
      if (interim) setPartialTranscript(interim);
      if (final) {
        setPartialTranscript("");
        setQuery(final);
        setListening(false);
        handleSearch(final);
      }
    };
    recognition.onerror = (event: any) => {
      setPartialTranscript("");
      if (event.error === "aborted") {
        setListening(false);
        return;
      }
      setError("Voice search error: " + event.error);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setPartialTranscript("");
    };
    recognitionRef.current = recognition;
    setListening(true);
    setPartialTranscript("");
    recognition.start();
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pseudo: PlaceResult = {
          name: "My Location",
          lat:  coords.latitude,
          lon:  coords.longitude,
        };
        setResults([pseudo]);
        setSelected(pseudo);
      },
      () => setError("Could not get your location")
    );
  };

  return (
    <div className="h-[calc(100vh-60px)] w-full flex bg-gray-50 dark:bg-[#041226] overflow-hidden">

      {/* ── Left panel ── */}
      <div className="w-[360px] flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[#060c18]">

        <div className="px-4 py-4 border-b border-gray-100 dark:border-white/[0.07]">
          <h1 className="text-[15px] font-bold text-gray-900 dark:text-white">
            Find a place
          </h1>
          <p className="text-[12px] text-gray-400 dark:text-white/40 mt-0.5">
            Search any city, landmark or address
          </p>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-white/[0.07]">
          <SearchBar
            onSearch={handleSearch}
            onVoice={handleVoiceSearch}
            onUpload={handleImageSearch}
            listening={listening}
            partialTranscript={partialTranscript}
          />
        </div>

        {/* Image upload preview */}
        {imagePreview && (
          <div className="flex flex-col items-center gap-2 px-4 pt-2">
            <div className="relative w-full flex flex-col items-center">
              <img
                src={imagePreview}
                alt="Uploaded preview"
                className="max-h-40 rounded-xl border border-gray-200 dark:border-white/[0.08] object-contain bg-white dark:bg-[#0c1626] shadow"
                style={{ maxWidth: '100%', margin: '0 auto' }}
              />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 bg-black/70 dark:bg-black/80 rounded-full text-white hover:bg-red-600/90 transition-colors shadow-lg z-10"
                title="Remove image"
                style={{transform: 'translate(50%, -50%)'}}
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l8 8M6 14L14 6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <span className="text-[12px] text-gray-400 dark:text-white/40">Image preview</span>
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
          <span className="text-[11px] text-gray-400 dark:text-white/30 whitespace-nowrap">
            {loading
              ? "Searching…"
              : results.length > 0
              ? `${results.length} results`
              : "No results yet"}
          </span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-2 text-[12px] text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading &&
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-gray-100 dark:bg-white/[0.05] animate-pulse"
              />
            ))}

          {!loading && results.length === 0 && query && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <span className="text-3xl">🔍</span>
              <p className="text-[13px] text-gray-500 dark:text-white/40">
                No results for "{query}"
              </p>
            </div>
          )}

          {!loading && results.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <span className="text-3xl">🗺️</span>
              <p className="text-[13px] text-gray-500 dark:text-white/40">
                Type a place name above to search
              </p>
            </div>
          )}

          {!loading &&
            results.map((place, idx) => (
              <div
                key={idx}
                onClick={() => setSelected(place)}
                className={`
                  p-3 rounded-xl border cursor-pointer transition-all duration-150
                  ${
                    selected?.name === place.name
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                      : "border-gray-100 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  }
                `}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selected?.name === place.name
                        ? "bg-emerald-500"
                        : "bg-gray-100 dark:bg-white/[0.06]"
                    }`}
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${
                        selected?.name === place.name
                          ? "text-white"
                          : "text-gray-400 dark:text-white/40"
                      }`}
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" />
                      <circle cx="10" cy="8" r="2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {place.name.split(",")[0]}
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5 line-clamp-1">
                      {place.name}
                    </p>
                    <p className="text-[10px] text-gray-300 dark:text-white/20 mt-0.5 font-mono">
                      {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-[1000]">
          <div className="bg-white/90 dark:bg-[#0c1626]/90 backdrop-blur border border-gray-200 dark:border-white/[0.07] px-4 py-2 rounded-xl text-[13px] font-medium text-gray-700 dark:text-white/80 shadow-sm">
            📍 Live Map
            {selected && (
              <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                → {selected.name.split(",")[0]}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleMyLocation}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-semibold shadow-sm transition-colors"
            >
              My Location
            </button>
          </div>
        </div>

        {/* Leaflet map — fills the parent */}
        <MapContainer
          center={
            selected
              ? [selected.lat, selected.lon]
              : [35.6895, 139.6917]
          }
          zoom={selected ? 13 : 4}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
          zoomControl={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Fly to selected place smoothly */}
          <FlyTo place={selected} />

          {results.map((place, idx) => (
            <Marker
              key={idx}
              position={[place.lat, place.lon]}
              eventHandlers={{ click: () => setSelected(place) }}
            >
              <Popup>
                <strong>{place.name.split(",")[0]}</strong>
                <br />
                <span className="text-xs text-gray-400">
                  {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* AI suggestion card */}
        <div className="pointer-events-auto absolute bottom-6 left-6 z-[1000] bg-white/95 dark:bg-[#0c1626]/95 backdrop-blur border border-gray-200 dark:border-white/[0.07] p-4 rounded-2xl shadow-lg w-[260px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">
              AI Suggestion
            </h3>
          </div>
          <p className="text-[12px] text-gray-500 dark:text-white/50 leading-relaxed">
            Best beaches near you are showing high ratings today.
          </p>
          <button className="mt-3 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-semibold transition-colors">
            Explore Now →
          </button>
        </div>
      </div>
    </div>
  );
}