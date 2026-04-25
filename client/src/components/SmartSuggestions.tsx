import { useEffect, useState } from "react";
import axios from "axios";

type Suggestion = {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
};

export default function SmartSuggestions({ userId }: { userId: number }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/suggestions/user/${userId}`, { withCredentials: true })
      .then(res => setSuggestions(res.data))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="p-4 text-gray-400">Loading suggestions...</div>;
  if (!suggestions.length) return <div className="p-4 text-gray-400">No suggestions yet.</div>;

  return (
    <div className="my-6">
      <h3 className="font-semibold mb-2">Recommended for you</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map(s => (
          <div key={s.id} className="bg-white dark:bg-[#0b1528] border border-gray-100 dark:border-white/[0.07] rounded-xl p-4 flex flex-col gap-2">
            {s.imageUrl && <img src={s.imageUrl} alt={s.name} className="w-full h-32 object-cover rounded mb-2" />}
            <div className="font-semibold text-gray-900 dark:text-white">{s.name}</div>
            <div className="text-sm text-gray-500 dark:text-white/40">{s.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
