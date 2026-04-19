// src/components/AboutSection.tsx

const stats = [
  { value: "180+", label: "Countries covered" },
  { value: "2M+", label: "Places in database" },
  { value: "98%", label: "Image AI accuracy" },
  { value: "<1s", label: "Average response time" },
];

const pills = [
  "React + TypeScript", "FastAPI", "Google Gemini",
  "PostgreSQL", "OpenStreetMap", "Redis",
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 bg-[#060c18]">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: Visual */}
          <div className="relative bg-[#0c1626] border border-white/8 rounded-[20px] p-9 flex items-center justify-center aspect-square overflow-hidden">
            {/* bg glow */}
            <div
              className="absolute w-[300px] h-[300px] rounded-full -top-14 -left-14 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(52,211,153,.1), transparent 70%)",
              }}
            />

            {/* Globe rings */}
            <div className="relative w-48 h-48 rounded-full border border-emerald-400/20 flex items-center justify-center">
              {/* Inner rings via pseudo — we use absolute divs */}
              <div className="absolute inset-5 rounded-full border border-indigo-400/15" />
              <div className="absolute inset-10 rounded-full border border-amber-400/10" />

              {/* Orbit dots */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white/8" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-400 border border-white/8" />
              <div className="absolute bottom-2 left-[30%] w-2.5 h-2.5 rounded-full bg-amber-400 border border-white/8" />

              {/* Center globe */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-[32px]">
                🌍
              </div>
            </div>

            {/* Pills at bottom */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2">
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className="text-xs px-3.5 py-1 rounded-full border border-white/8 text-slate-400"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div>
            <p className="text-[11px] font-semibold tracking-[.12em] uppercase text-emerald-400 mb-3">About</p>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-white tracking-[-1px] mb-4 font-['Syne']">
              Built for curious<br />explorers
            </h2>
            <p className="text-base text-slate-400 max-w-[440px] mb-3">
              Place Finder AI was built to make travel discovery feel effortless. We believe finding your next destination should be as simple as describing a feeling — not filling out a form.
            </p>
            <p className="text-base text-slate-400 max-w-[440px] mb-8">
              Powered by Google Gemini, OpenStreetMap, and a full-stack architecture built for speed and reliability, we've made intelligent travel discovery accessible to everyone.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/[0.04] border border-white/8 rounded-xl p-5"
                >
                  <div className="text-[28px] font-bold text-white font-['Syne']">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}