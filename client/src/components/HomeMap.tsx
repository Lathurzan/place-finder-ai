// src/components/HomeMap.tsx
import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Fix Leaflet marker icons in Vite ────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type MapTab = "Bookmarks" | "Trending" | "Nearby";

export interface BookmarkPin {
  name:     string;
  location: string; // "Kyoto, Japan"
}

interface Pin {
  label: string;
  lat:   number;
  lon:   number;
}

// Trending destinations geocoded on demand — no mock coords
const TRENDING_QUERIES: string[] = [
  "Santorini, Greece",
  "Kyoto, Japan",
  "Amalfi Coast, Italy",
  "New York, USA",
  "Patagonia, Argentina",
  "Machu Picchu, Peru",
  "Serengeti, Tanzania",
];

const PIN_COLORS: Record<MapTab, string> = {
  Bookmarks: "#6366f1",
  Trending:  "#10b981",
  Nearby:    "#f59e0b",
};

// ── Smooth fly-to whenever coordinates change ────────────────────────────
function FlyTo({ lat, lon, zoom }: { lat: number; lon: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], zoom, { duration: 1.2 });
  }, [lat, lon, zoom, map]);
  return null;
}

// ── Coloured teardrop marker ─────────────────────────────────────────────
function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:22px;height:22px;border-radius:50% 50% 50% 0;
        background:${color};border:3px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,.35);
        transform:rotate(-45deg)">
      </div>
    </div>`,
    iconSize:    [22, 28],
    iconAnchor:  [11, 28],
    popupAnchor: [0, -30],
  });
}

interface Props {
  bookmarks: BookmarkPin[];
  mapView:   MapTab;
}

export default function HomeMap({ bookmarks, mapView }: Props) {
  const [pins,    setPins]    = useState<Pin[]>([]);
  const [center,  setCenter]  = useState<[number, number]>([20, 10]);
  const [zoom,    setZoom]    = useState(2);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // ── geocode a single query via your backend ────────────────────────────
  const geocodeOne = useCallback(async (query: string): Promise<Pin | null> => {
    try {
      const res  = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.error || data.lat === undefined) return null;
      return {
        label: query.split(",")[0],
        lat:   parseFloat(data.lat),
        lon:   parseFloat(data.lon),
      };
    } catch {
      return null;
    }
  }, []);

  // ── reload pins when tab or bookmarks change ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    setPins([]);
    setError(null);
    setLoading(true);

    (async () => {
      try {
        if (mapView === "Trending") {
          const results = await Promise.all(TRENDING_QUERIES.map(geocodeOne));
          if (cancelled) return;
          const valid = results.filter(Boolean) as Pin[];
          setPins(valid);
          if (valid.length > 0) { setCenter([valid[0].lat, valid[0].lon]); setZoom(3); }
        }

        else if (mapView === "Bookmarks") {
          if (bookmarks.length === 0) {
            setPins([]);
            setLoading(false);
            return;
          }
          const queries = bookmarks.map((b) =>
            b.location ? `${b.name}, ${b.location}` : b.name
          );
          const results = await Promise.all(queries.map(geocodeOne));
          if (cancelled) return;
          const valid = results.filter(Boolean) as Pin[];
          setPins(valid);
          if (valid.length > 0) { setCenter([valid[0].lat, valid[0].lon]); setZoom(4); }
        }

        else if (mapView === "Nearby") {
          if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              if (cancelled) return;
              const { latitude: lat, longitude: lon } = pos.coords;
              setCenter([lat, lon]);
              setZoom(12);
              // Search for real nearby places using reverse geocode to get city name
              try {
                const revRes  = await fetch(`/api/places/reverse?lat=${lat}&lon=${lon}`);
                const revData = revRes.ok ? await revRes.json() : null;
                const city    = revData?.display_name?.split(",")[0] ?? "nearby";
                const srchRes = await fetch(
                  `/api/places/search-multiple?q=tourist+places+in+${encodeURIComponent(city)}`
                );
                const nearby: { name: string; lat: number; lon: number }[] =
                  srchRes.ok ? await srchRes.json() : [];
                if (!cancelled) {
                  setPins([
                    { label: "You are here", lat, lon },
                    ...nearby.slice(0, 6).map((p) => ({
                      label: p.name.split(",")[0],
                      lat:   p.lat,
                      lon:   p.lon,
                    })),
                  ]);
                }
              } catch {
                if (!cancelled) setPins([{ label: "You are here", lat, lon }]);
              }
              if (!cancelled) setLoading(false);
            },
            () => {
              if (!cancelled) {
                setError("Location access denied. Enable location permission in your browser.");
                setLoading(false);
              }
            }
          );
          return; // loading handled inside geolocation callback
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Map failed to load.");
      } finally {
        if (!cancelled && mapView !== "Nearby") setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [mapView, bookmarks, geocodeOne]);

  const color = PIN_COLORS[mapView];

  return (
    <div className="relative flex-1 min-h-[280px] overflow-hidden">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70 dark:bg-[#041226]/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[13px] font-medium text-gray-600 dark:text-white/60">
            <svg className="w-4 h-4 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                strokeDasharray="31.4 31.4" strokeLinecap="round"/>
            </svg>
            Loading {mapView.toLowerCase()}…
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && !loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-[12px] text-red-500 dark:text-red-400 text-center max-w-xs">
            {error}
          </div>
        </div>
      )}

      {/* Empty state for bookmarks */}
      {!loading && !error && pins.length === 0 && mapView === "Bookmarks" && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">🔖</div>
            <p className="text-[13px] text-gray-500 dark:text-white/40">
              No bookmarks to show on map
            </p>
          </div>
        </div>
      )}

      {/* Leaflet map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyTo lat={center[0]} lon={center[1]} zoom={zoom} />

        {pins.map((pin, idx) => (
          <Marker
            key={`${mapView}-${idx}-${pin.lat}`}
            position={[pin.lat, pin.lon]}
            icon={makeIcon(color)}
          >
            <Popup>
              <div className="text-[13px] font-semibold">{pin.label}</div>
              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                {pin.lat.toFixed(4)}, {pin.lon.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom zoom buttons */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1">
        {["+", "−"].map((z) => (
          <button
            key={z}
            className="w-7 h-7 bg-white dark:bg-[#0c1626] border border-gray-200 dark:border-white/10
              rounded-lg text-gray-600 dark:text-white/60 text-sm font-bold
              hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm"
          >
            {z}
          </button>
        ))}
      </div>

      {/* Pin legend */}
      {pins.length > 0 && !loading && (
        <div className="absolute bottom-4 left-4 z-[1000] flex flex-wrap gap-1.5 max-w-[55%]">
          {pins.slice(0, 5).map((pin) => (
            <span
              key={pin.label}
              className="flex items-center gap-1 text-[11px] font-medium
                bg-white/90 dark:bg-[#0c1626]/90 backdrop-blur
                border border-gray-200 dark:border-white/10
                rounded-full px-2.5 py-1 text-gray-700 dark:text-white/70"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: color }} />
              {pin.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}