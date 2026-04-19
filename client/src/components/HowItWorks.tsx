// src/components/HowItWorksSection.tsx
const steps = [
  {
    num: "01",
    title: "Search or upload",
    desc: "Type a description, speak your destination, or drop any travel image into the search panel.",
  },
  {
    num: "02",
    title: "AI analyses your input",
    desc: "Gemini processes your query — identifying places, matching intent, and ranking the best results.",
  },
  {
    num: "03",
    title: "Map updates instantly",
    desc: "Results are pinned on the live map with weather, ratings, and nearby points of interest.",
  },
  {
    num: "04",
    title: "Save and plan your trip",
    desc: "Bookmark favourites and let the AI build a full day-by-day itinerary, saved to your dashboard.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="howitworks" className="py-24 px-6 bg-[#060c18]">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Steps */}
          <div>
            <p className="text-[11px] font-semibold tracking-[.12em] uppercase text-emerald-400 mb-3">How it works</p>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-white tracking-[-1px] mb-10 font-['Syne']">
              From search<br />to destination
            </h2>
            <div className="flex flex-col">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`group flex gap-5 py-6 cursor-pointer transition-all ${
                    i < steps.length - 1 ? "border-b border-white/8" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[13px] bg-white/[0.04] border border-white/8 text-slate-400 group-hover:bg-emerald-400 group-hover:text-[#022c22] group-hover:border-emerald-400 transition-all font-['Syne']">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-white mb-1 font-['Syne']">{step.title}</h4>
                    <p className="text-[13px] text-slate-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Mock visual */}
          <div className="bg-[#0c1626] border border-white/8 rounded-[20px] p-8 flex flex-col gap-3.5 justify-center min-h-[420px]">
            <div className="text-[11px] text-slate-500 tracking-[.08em] uppercase mb-1">Finder preview</div>

            {/* Image placeholder */}
            <div className="bg-white/[0.04] border border-dashed border-white/8 rounded-xl h-36 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              Drop an image to identify location
            </div>

            {/* Progress bar */}
            <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-[78%]" />
            </div>

            {/* Result row */}
            <div className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3.5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-1.5 bg-white/8 rounded w-3/5" />
                <div className="h-1.5 bg-white/8 rounded w-2/5" />
              </div>
              <div className="text-[11px] text-emerald-400 whitespace-nowrap">97% match</div>
            </div>

            {/* Mini map */}
            <div className="bg-white/[0.04] border border-white/8 rounded-xl h-24 grid grid-cols-3 grid-rows-2 gap-0.5 overflow-hidden">
              <div className="bg-emerald-400/[0.04]" />
              <div className="bg-emerald-400/[0.04] flex items-center justify-center text-lg">📍</div>
              <div className="bg-emerald-400/[0.04]" />
              <div className="bg-emerald-400/[0.15]" />
              <div className="bg-emerald-400/[0.15]" />
              <div className="bg-emerald-400/[0.04]" />
            </div>

            {/* Second result row */}
            <div className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3.5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-1.5 bg-white/8 rounded w-4/5" />
                <div className="h-1.5 bg-white/8 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}