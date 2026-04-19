// src/components/MarqueeBanner.tsx
const ITEMS = [
  "AI-powered discovery", "Voice search", "Image recognition",
  "Smart itineraries", "Live weather", "OpenStreetMap",
  "Bookmark & save", "Multilingual AI", "Route planning", "Trending destinations",
];

export default function MarqueeBanner() {
  const doubled = [...ITEMS, ...ITEMS]; // duplicate for seamless loop

  return (
    <div className="overflow-hidden border-t border-b border-white/8 bg-white/[0.02] py-3.5">
      <div className="flex gap-[60px] w-max animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="text-[13px] text-slate-500 whitespace-nowrap flex items-center gap-2.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}