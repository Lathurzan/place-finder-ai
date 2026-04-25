import { useState } from "react";
import axios from "axios";

export default function TripOptimizer({ itinerary }: { itinerary: any }) {
  const [optimized, setOptimized] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/ai/optimize-trip", { itinerary }, { withCredentials: true });
      setOptimized(res.data.optimized);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Error optimizing trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6">
      <button
        onClick={optimize}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all"
      >
        {loading ? "Optimizing..." : "Optimize Trip"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {optimized && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-[#0b1528] border border-gray-100 dark:border-white/[0.07] rounded-xl">
          <h4 className="font-semibold mb-2">Optimized Route & Times</h4>
          <ol className="list-decimal ml-5">
            {optimized.stops.map((stop: any, i: number) => (
              <li key={i} className="mb-1">
                <span className="font-medium">{stop.name}</span> — {stop.time}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
