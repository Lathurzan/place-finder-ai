import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type Rec = {
  id?: number;
  name?: string;
  description?: string;
  col_13?: string; // image_url in CSV
  tags?: string;
  similarity?: number | null;
};

export default function Recommendations() {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/ml/recommendations-csv?top_n=12`);
        if (!res.ok) throw new Error(`ML API ${res.status}`);
        const data = await res.json();
        setRecs(data.recommendations || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Place recommendations</h1>
      {loading && <div className="text-gray-500">Loading recommendations…</div>}
      {error && (
        <div className="text-red-500">Error loading recommendations: {error}</div>
      )}

      {!loading && !error && recs.length === 0 && (
        <div className="text-gray-600">No recommendations available.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {recs.map((r) => (
          <div key={r.id || r.name} className="bg-white rounded-lg shadow p-4">
            {r.col_13 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.col_13} alt={r.name} className="w-full h-40 object-cover rounded-md mb-3" />
            ) : (
              <div className="w-full h-40 bg-gray-100 rounded-md mb-3 flex items-center justify-center">No image</div>
            )}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg truncate">{r.name}</h3>
              <div className="text-sm text-gray-500">{r.similarity ? `${(r.similarity * 100).toFixed(1)}%` : ""}</div>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{r.description}</p>
            {r.tags && <div className="text-xs text-gray-500 mt-3">{r.tags}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
