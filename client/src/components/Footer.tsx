// src/components/Footer.tsx

const links = {
  Product: ["Features", "How it works", "Pricing", "Changelog"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Cookies", "API docs"],
};

export default function Footer() {
  return (
    <footer className="bg-[#0c1626] border-t border-white/8 px-6 pt-16 pb-8">
      <div className="max-w-[1100px] mx-auto">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2 font-bold text-[18px] text-white no-underline mb-3.5 font-['Syne']">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Place Finder AI
            </a>
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-[260px]">
              AI-powered travel discovery. Find any destination by text, voice, or image — and plan your entire trip in seconds.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([col, items]) => (
            <div key={col}>
              <h4 className="text-[13px] font-semibold text-white mb-4 font-['Syne']">{col}</h4>
              <ul className="flex flex-col gap-2.5 list-none">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[13px] text-slate-500 no-underline hover:text-slate-200 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[12px] text-slate-500">
          <span>© 2025 Place Finder AI. All rights reserved.</span>

          {/* Social icons */}
          <div className="flex gap-2.5">
            {/* Twitter */}
            <button className="w-8 h-8 rounded-full border border-white/8 flex items-center justify-center hover:border-white/20 hover:bg-white/[0.04] transition-all">
              <svg className="w-3 h-3 stroke-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </button>
            {/* GitHub */}
            <button className="w-8 h-8 rounded-full border border-white/8 flex items-center justify-center hover:border-white/20 hover:bg-white/[0.04] transition-all">
              <svg className="w-3 h-3 stroke-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
              </svg>
            </button>
            {/* LinkedIn */}
            <button className="w-8 h-8 rounded-full border border-white/8 flex items-center justify-center hover:border-white/20 hover:bg-white/[0.04] transition-all">
              <svg className="w-3 h-3 stroke-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}