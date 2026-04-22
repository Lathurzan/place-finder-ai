// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerImage from "../assets/registerLeftImage.jpg";
import registerImage1 from "../assets/registerLeftImage1.jpg";
import registerImage2 from "../assets/rigisterLeftImage2.webp";
import heroBg from "../assets/heroSectionImage.jpg";

export default function Login() {
  // theme removed: static UI (no dark/light toggle)
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      let data: any = {};
      try { data = await res.json(); } catch (e) { /* non-json */ }

      if (!res.ok) {
        const extractMessage = (d: any) => {
          if (!d) return `Login failed (${res.status})`;
          if (typeof d === "string") return d;
          if (Array.isArray(d?.detail)) return d.detail.map((it:any)=> it?.msg || JSON.stringify(it)).join('; ');
          if (typeof d.detail === 'string') return d.detail;
          if (d?.message) return d.message;
          try { return JSON.stringify(d); } catch { return String(d); }
        };
        const message = extractMessage(data);
        console.error('Login error', res.status, data);
        alert(message);
        return;
      }

      if (data?.access_token) {
        try {
          localStorage.setItem('pf_token', data.access_token);
          localStorage.setItem('pf_user', JSON.stringify(data.user || {}));
        } catch (err) {}
        navigate('/home');
      } else {
        alert('Unexpected response from server');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while signing in. Check backend and network.');
    } finally {
      setLoading(false);
    }
  };

  // removed dark/light mode logic

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg)" }}
    >
  {/* Static background decoration (no dark/light mode) */}
  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(52,211,153,.08) 0%, transparent 60%)" }} />

      {/* Card (two-column like Register) */}
      <div className="relative z-10 w-full max-w-6xl rounded-3xl border p-0 animate-slide-in" style={{ background: "var(--bg2)", borderColor: "var(--card-border)" }}>
        <div className="w-full max-w-6xl bg-transparent rounded-3xl overflow-hidden flex flex-col md:flex-row">

          {/* Left image fan */}
          <div
            className="hidden md:flex md:w-1/2 items-center justify-center p-8 relative"
            style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-[#060c18]/50 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/8 to-indigo-500/8 pointer-events-none" />
            <div className="relative z-10 w-full" style={{ height: 420 }}>
              <div className="absolute rounded-2xl overflow-hidden shadow-xl border border-white/10" style={{ marginTop: 130, width: "75%", aspectRatio: "4 / 3", left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(-14deg) translateX(-22%)", zIndex: 1 }}>
                <img src={registerImage} alt="Travel A" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="absolute rounded-2xl overflow-hidden shadow-xl border border-white/10" style={{ marginTop: -60, marginLeft: 40, width: "75%", aspectRatio: "4 / 3", left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(14deg) translateX(22%)", zIndex: 2 }}>
                <img src={registerImage2} alt="Travel C" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="absolute rounded-2xl overflow-hidden shadow-2xl border border-white/20" style={{ marginTop: -140, marginLeft: -50, width: "75%", aspectRatio: "4 / 3", left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(-10deg)", zIndex: 3 }}>
                <img src={registerImage1} alt="Travel B" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
            <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/40 tracking-widest uppercase z-10">Discover the world with AI</p>
          </div>

          {/* Right form */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md bg-transparent border border-white/8 rounded-2xl p-8 relative">
              <Link
                to="/"
                aria-label="Back to landing"
                title="Back to landing"
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-700/60 text-white flex items-center justify-center hover:bg-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <Link to="/" className="flex items-center gap-2 mb-6 justify-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="font-bold text-sm">Place Finder AI</span>
              </Link>

              <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
              <p className="text-sm text-gray-400 mb-6">Sign in to continue exploring the world</p>

              {/* Google OAuth first */}
              <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-black font-medium mb-4 hover:bg-gray-200 transition" onClick={() => { /* TODO: trigger OAuth */ }}>
                <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                  <path d="M533.5 278.4c0-18.5-1.5-36.3-4.3-53.6H272v101.3h146.9c-6.3 34-25 62.8-53.5 82.1v68.2h86.3c50.4-46.4 81.8-114.9 81.8-198z" fill="#4285F4" />
                  <path d="M272 544.3c72.6 0 133.6-24.1 178.1-65.4l-86.3-68.2c-24 16.1-54.7 25.6-91.8 25.6-70.6 0-130.4-47.6-151.8-111.6H32.3v69.9C76.6 483.6 169.5 544.3 272 544.3z" fill="#34A853" />
                  <path d="M120.2 328.5c-10.5-31.1-10.5-64.7 0-95.8V162.8H32.3c-39.6 79.2-39.6 173.6 0 252.8l87.9-87.1z" fill="#FBBC05" />
                  <path d="M272 107.7c38.9 0 73.9 13.4 101.5 39.7l76.1-76.1C405.6 24.1 344.6 0 272 0 169.5 0 76.6 60.7 32.3 162.8l87.9 69.9C141.6 155.3 201.4 107.7 272 107.7z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>

                          <div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-px bg-white/10" />
  
  <span className="text-xs text-gray-400 whitespace-nowrap">
    or
  </span>

  <div className="flex-1 h-px bg-white/10" />
</div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#111f35] border border-white/10 text-sm outline-none focus:border-emerald-400"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-[#111f35] border border-white/10 text-sm outline-none focus:border-emerald-400"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--muted)" }}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded accent-emerald-400" />
                  <span className="text-sm" style={{ color: "var(--muted2)" }}>Remember me for 30 days</span>
                </label>

                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-emerald-400 text-[#022c22] font-semibold text-sm hover:bg-emerald-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                      Signing in…
                    </>
                  ) : "Sign in"}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
                Don't have an account? <Link to="/register" className="text-emerald-400 hover:text-emerald-300 transition-colors duration-150 font-medium">Sign up free</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}