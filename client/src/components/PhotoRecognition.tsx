import { useRef, useState } from "react";
import axios from "axios";

type Suggestion = {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
};

export default function PhotoRecognition() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuggestions([]);
    setError(null);
  };

  const recognize = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await axios.post("/api/ai/photo-recognition", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setSuggestions(res.data.suggestions);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Recognition failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6">
      <div className="flex items-center gap-3 mb-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all"
        >
          Upload Photo
        </button>
        {file && (
          <button
            onClick={recognize}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all"
          >
            {loading ? "Recognizing..." : "Get Suggestions"}
          </button>
        )}
      </div>
      {preview && <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded mb-3 border" />}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {suggestions.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Place Suggestions</h4>
          <ul className="space-y-2">
            {suggestions.map(s => (
              <li key={s.id} className="bg-white dark:bg-[#0b1528] border border-gray-100 dark:border-white/[0.07] rounded-xl p-3">
                <div className="font-semibold text-gray-900 dark:text-white">{s.name}</div>
                <div className="text-sm text-gray-500 dark:text-white/40">{s.description}</div>
                {s.imageUrl && <img src={s.imageUrl} alt={s.name} className="w-32 h-20 object-cover rounded mt-2" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
