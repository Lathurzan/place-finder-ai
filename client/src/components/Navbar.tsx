// src/components/Navbar.tsx
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[1100px] z-50">
      <nav className="flex items-center justify-between bg-[rgba(6,12,24,0.72)] backdrop-blur-xl border border-white/8 rounded-full px-7 py-2.5 gap-3">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 font-bold text-[17px] text-white no-underline whitespace-nowrap font-['Syne']">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Place Finder AI
        </a>

        {/* Nav Links */}
        <ul className="hidden md:flex gap-1 list-none">
          {["Features", "How it works", "Pricing", "About"].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                className="text-slate-400 text-sm px-3.5 py-1.5 rounded-full no-underline hover:text-white hover:bg-white/6 transition-all"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="hidden sm:block text-slate-400 text-[13px] font-medium px-5 py-2 rounded-full border border-white/8 hover:border-white/20 hover:text-white transition-all no-underline"
          >
            Sign in
          </a>
          <a
            href="#"
            className="bg-emerald-400 text-[#022c22] text-[13px] font-semibold px-5 py-2 rounded-full hover:bg-emerald-300 hover:-translate-y-px transition-all no-underline whitespace-nowrap"
          >
            Get started
          </a>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="flex md:hidden flex-col gap-1 cursor-pointer p-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="w-5 h-0.5 bg-slate-400 rounded" />
          <span className="w-5 h-0.5 bg-slate-400 rounded" />
          <span className="w-5 h-0.5 bg-slate-400 rounded" />
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mt-2 bg-[rgba(6,12,24,0.95)] backdrop-blur-xl border border-white/8 rounded-2xl p-4 flex flex-col gap-2">
          {["Features", "How it works", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
              className="text-slate-400 text-sm px-4 py-2 rounded-xl hover:text-white hover:bg-white/6 transition-all no-underline"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}