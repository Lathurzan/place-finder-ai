import { useRef, useState } from "react";

type Props = {
  onSearch: (query: string) => void;
  onUpload?: (file: File) => void;
  onVoice?: () => void;
  placeholder?: string;
  listening?: boolean;
  partialTranscript?: string;
};


const SearchBar = ({ onSearch, onUpload, onVoice, placeholder = "Search places, cities, beaches...", listening = false, partialTranscript = "" }: Props) => {
  const [value, setValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If listening and partialTranscript is available, show it in the input
  const displayValue = listening && partialTranscript ? partialTranscript : value;

  const handleSearch = () => {
    if (!value.trim()) return;
    onSearch(value.trim());
  };

  return (
    <div className="w-full space-y-2">
      {/* Input row */}
      <div className={`
        flex items-center gap-2
        bg-gray-50 dark:bg-white/[0.05]
        border border-gray-200 dark:border-white/[0.1]
        rounded-2xl px-4 py-2.5
        focus-within:border-emerald-400 dark:focus-within:border-emerald-500
        focus-within:bg-white dark:focus-within:bg-white/[0.08]
        transition-all duration-150
        ${listening ? 'ring-2 ring-emerald-400 dark:ring-emerald-500 border-emerald-400 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-500/10' : ''}
      `}>
        {/* Search icon */}
        <svg className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7"/>
          <path d="M21 21l-4.3-4.3"/>
        </svg>

        {/* Input */}
        <input
          type="text"
          value={displayValue}
          placeholder={placeholder}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          className={
            `flex-1 bg-transparent outline-none text-[13px] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 font-medium ${listening ? 'animate-pulse' : ''}`
          }
          readOnly={listening}
        />

        {/* Clear */}
        {value && (
          <button onClick={() => setValue("")} className="text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white text-sm transition-colors">
            ✕
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-4 bg-gray-200 dark:bg-white/[0.08]"/>

        {/* Image upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Image search"
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all"
        >
          <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </button>

        {/* Voice */}
        <button
          type="button"
          onClick={onVoice}
          title="Voice search"
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all
            ${listening ? 'bg-emerald-500 text-white animate-pulse' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08]'}`}
        >
          {listening ? (
            <svg className="w-[14px] h-[14px] animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/>
            </svg>
          ) : (
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/>
            </svg>
          )}
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f && onUpload) onUpload(f); e.currentTarget.value = ""; }}
        />
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-semibold transition-all duration-150 active:scale-[0.98]"
        disabled={listening}
      >
        {listening ? (
          <span className="flex items-center gap-2 justify-center">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Listening…
          </span>
        ) : (
          'Search places'
        )}
      </button>
    </div>
  );
};

export default SearchBar;