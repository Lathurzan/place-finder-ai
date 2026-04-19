import { useState, useRef } from "react";

type Props = {
  onSearch: (query: string) => void;
  onUpload?: (file: File) => void;
  onVoice?: () => void;
};

const SearchBar = ({ onSearch, onUpload, onVoice }: Props) => {
  const [value, setValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = () => {
    if (!value.trim()) return;
    onSearch(value.trim());
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onUpload) onUpload(file);
    // reset the input so the same file can be re-selected later
    e.currentTarget.value = "";
  };

  const handleVoiceClick = () => {
    if (onVoice) onVoice();
    else console.log("Voice search triggered");
  };

  return (
    <div className="w-full">

      {/* Rounded input container (only the text field row) */}
      <div className="w-full flex items-center gap-2 bg-[#111f35] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition-all">
        {/* Search Icon */}
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>

        {/* Input */}
        <input
          type="text"
          value={value}
          placeholder="Search places, cities, beaches..."
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
        />

        {/* Image upload button */}
        <button
          type="button"
          onClick={handleFileClick}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/6 border border-white/8 hover:bg-white/12 transition-all"
          title="Image upload"
        >
          <svg className="w-4 h-4 stroke-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>

        {/* Mic (voice) button */}
        <button
          type="button"
          onClick={handleVoiceClick}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/6 border border-white/8 hover:bg-white/12 transition-all"
          title="Voice search"
        >
          <svg className="w-4 h-4 stroke-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" />
          </svg>
        </button>

        {/* Clear Button */}
        {value && (
          <button
            onClick={() => setValue("")}
            className="text-gray-400 hover:text-white text-sm"
          >
            ✕
          </button>
        )}

        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Button outside and below the rounded input */}
      <div className="mt-3">
        <button
          onClick={handleSearch}
          className="w-full px-4 py-2 rounded-xl bg-emerald-400 text-[#022c22] text-sm font-semibold hover:bg-emerald-300 transition"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
