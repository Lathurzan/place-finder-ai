// src/pages/Register.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import registerImage from "../assets/registerLeftImage.jpg";
import registerImage1 from "../assets/registerLeftImage1.jpg";
import registerImage2 from "../assets/rigisterLeftImage2.webp";
import heroBg from "../assets/heroSectionImage.jpg";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  // Live validation helpers
  const passwordsMatch = form.password === form.confirmPassword;
  const showPasswordError = form.confirmPassword.length > 0 && !passwordsMatch;

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 py-8" style={{ backgroundColor: "var(--bg)" }}>
        <div className="w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row" style={{ background: "var(--bg2)", border: "1px solid", borderColor: "var(--card-border)" }}>

        {/* ── Left: Image fan ── */}
        <div
          className="hidden md:flex md:w-1/2 items-center justify-center p-8 relative"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlays */}
          <div className="absolute inset-0 bg-[#060c18]/50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/8 to-indigo-500/8 pointer-events-none" />

          {/* Fan wrapper — all 3 cards positioned inside this box */}
          <div className="relative z-10 w-full" style={{ height: 420 }}>

            {/* Card LEFT — rotated -14°, shifted left */}
            <div
              className="absolute rounded-2xl overflow-hidden shadow-xl border border-white/10"
              style={{
                marginTop: 130,
                width: "75%",
                aspectRatio: "4 / 3",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) rotate(-14deg) translateX(-22%)",
                zIndex: 1,
              }}
            >
              <img src={registerImage} alt="Travel A" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Card RIGHT — rotated +14°, shifted right */}
            <div
              className="absolute rounded-2xl overflow-hidden shadow-xl border border-white/10"
              style={{
                marginTop: -60,
                marginLeft: 40,
                width: "75%",
                aspectRatio: "4 / 3",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) rotate(14deg) translateX(22%)",
                zIndex: 2,
              }}
            >
              <img src={registerImage2} alt="Travel C" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Card CENTER — flat, on top */}
            <div
              className="absolute rounded-2xl overflow-hidden shadow-2xl border border-white/20"
              style={{
                marginTop:-140,
                marginLeft: -50,
                width: "75%",
                aspectRatio: "4 / 3",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) rotate(-10deg)",
                zIndex: 3,
              }}
            >
              <img src={registerImage1} alt="Travel B" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Caption */}
          <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/40 tracking-widest uppercase z-10">
            Discover the world with AI
          </p>
        </div>

        {/* ── Right: Form ── */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-transparent border border-white/8 rounded-2xl p-8 relative">
            {/* Back button: gray round with left arrow */}
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

            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-sm text-gray-400 mb-6">Start exploring with AI</p>

            {/* Google OAuth */}
            <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-black font-medium mb-4 hover:bg-gray-200 transition">
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                <path d="M533.5 278.4c0-18.5-1.5-36.3-4.3-53.6H272v101.3h146.9c-6.3 34-25 62.8-53.5 82.1v68.2h86.3c50.4-46.4 81.8-114.9 81.8-198z" fill="#4285F4" />
                <path d="M272 544.3c72.6 0 133.6-24.1 178.1-65.4l-86.3-68.2c-24 16.1-54.7 25.6-91.8 25.6-70.6 0-130.4-47.6-151.8-111.6H32.3v69.9C76.6 483.6 169.5 544.3 272 544.3z" fill="#34A853" />
                <path d="M120.2 328.5c-10.5-31.1-10.5-64.7 0-95.8V162.8H32.3c-39.6 79.2-39.6 173.6 0 252.8l87.9-87.1z" fill="#FBBC05" />
                <path d="M272 107.7c38.9 0 73.9 13.4 101.5 39.7l76.1-76.1C405.6 24.1 344.6 0 272 0 169.5 0 76.6 60.7 32.3 162.8l87.9 69.9C141.6 155.3 201.4 107.7 272 107.7z" fill="#EA4335" />
              </svg>
              Sign up with Google
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
                type="text"
                placeholder="Full name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-4 py-3 rounded-xl bg-[#111f35] border border-white/10 text-sm outline-none focus:border-emerald-400"
              />
              <input
                type="email"
                placeholder="Email address"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-4 py-3 rounded-xl bg-[#111f35] border border-white/10 text-sm outline-none focus:border-emerald-400"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`px-4 py-3 rounded-xl bg-[#111f35] border ${showPasswordError ? 'border-red-500' : 'border-white/10'} text-sm outline-none focus:border-emerald-400`}
                aria-invalid={showPasswordError}
              />
              <input
                type="password"
                placeholder="Re-enter password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`px-4 py-3 rounded-xl bg-[#111f35] border ${showPasswordError ? 'border-red-500' : 'border-white/10'} text-sm outline-none focus:border-emerald-400`}
                aria-invalid={showPasswordError}
              />

              {showPasswordError && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 py-3 rounded-xl bg-emerald-400 text-[#022c22] font-semibold hover:bg-emerald-300 transition disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors duration-150 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}