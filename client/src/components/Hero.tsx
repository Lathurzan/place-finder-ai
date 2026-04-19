// src/components/HeroSection.tsx
import heroImg from "../assets/heroSectionImage.jpg";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center text-center px-6 pt-32 pb-20 relative overflow-hidden"
    >
      {/* Background gradients */}
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.55)",
        }}
      />

      {/* Background gradients */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(52,211,153,.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(129,140,248,.12) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 70%, rgba(245,158,11,.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 30%, black 0%, transparent 100%)",
        }}
      />

      {/* Content */}
  <div className="relative z-20 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 rounded-full text-xs font-medium px-3.5 py-1.5 mb-7 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now with Gemini Vision — search by image
        </div>

        {/* Title */}
        <h1 className="text-[clamp(44px,8vw,86px)] font-extrabold tracking-[-2px] text-white mb-5 font-['Syne'] leading-tight">
          Discover the world
          <br />
          with{" "}
          <span className="bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            AI intuition
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-slate-400 font-light max-w-lg mx-auto mb-10">
          Search any destination by text, voice, or photo. Get personalised
          itineraries, live maps, and smart recommendations — all in seconds.
        </p>

        {/* Search bar */}
        <div className="flex items-center bg-white/6 border border-white/12 rounded-full px-6 py-1.5 max-w-[560px] mx-auto mb-12 gap-2.5 backdrop-blur-md">
          <input
            type="text"
            placeholder='Try "beaches in Greece" or upload a photo...'
            className="flex-1 bg-transparent border-none outline-none text-slate-200 text-sm placeholder-slate-500 font-['DM_Sans']"
          />
          <div className="flex items-center gap-1.5">
            {/* Mic icon */}
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/6 border border-white/8 hover:bg-white/12 transition-all" title="Voice search">
              <svg className="w-4 h-4 stroke-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" />
              </svg>
            </button>
            {/* Image icon */}
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/6 border border-white/8 hover:bg-white/12 transition-all" title="Image upload">
              <svg className="w-4 h-4 stroke-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
            <button className="bg-emerald-400 text-[#022c22] font-semibold text-[13px] px-5 py-2 rounded-full hover:bg-emerald-300 transition-all">
              Search
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 flex-wrap">
          {[
            { value: "180+", label: "countries mapped" },
            { value: "2M+", label: "places discovered" },
            { value: "98%", label: "AI accuracy" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-[22px] font-bold text-white font-['Syne']">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
