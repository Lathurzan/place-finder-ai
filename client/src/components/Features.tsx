// src/components/FeaturesSection.tsx
interface Feature {
  accent: string;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    accent: "#34d399",
    iconBg: "rgba(52,211,153,.1)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    title: "AI text search",
    desc: "Describe any place in natural language. Our AI understands context, mood, and preference to surface the perfect destination.",
  },
  {
    accent: "#818cf8",
    iconBg: "rgba(129,140,248,.1)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    title: "Image recognition",
    desc: "Upload any travel photo and our Gemini Vision AI instantly identifies the location, country, and nearby attractions.",
  },
  {
    accent: "#f59e0b",
    iconBg: "rgba(245,158,11,.1)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="2" width="6" height="11" rx="3" />
        <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" />
      </svg>
    ),
    title: "Voice search",
    desc: "Just speak your destination. Browser-native voice recognition converts your words into precise map results instantly.",
  },
  {
    accent: "#34d399",
    iconBg: "rgba(52,211,153,.1)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Interactive map",
    desc: "Full-screen Leaflet maps with custom markers, route planning, and OpenRouteService-powered directions.",
  },
  {
    accent: "#f59e0b",
    iconBg: "rgba(245,158,11,.1)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    title: "Smart itineraries",
    desc: "Our AI generates day-by-day travel plans tailored to your duration, interests, and travel style — ready to bookmark and share.",
  },
  {
    accent: "#818cf8",
    iconBg: "rgba(129,140,248,.1)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
      </svg>
    ),
    title: "Live weather insights",
    desc: "See real-time weather conditions and seasonal recommendations for every destination so you always travel at the right time.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-[#0c1626]">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="mb-14">
          <p className="text-[11px] font-semibold tracking-[.12em] uppercase text-emerald-400 mb-3">Features</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-white tracking-[-1px] mb-4 font-['Syne']">
            Everything you need<br />to explore smarter
          </h2>
          <p className="text-base text-slate-400 max-w-md">
            Six powerful tools combined into one seamless travel discovery experience.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-white/[0.04] border border-white/8 rounded-2xl p-7 overflow-hidden hover:-translate-y-1 hover:border-white/15 transition-all duration-200"
            >
              {/* Top shimmer line on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)`,
                }}
              />
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.iconBg }}
              >
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2 font-['Syne']">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}