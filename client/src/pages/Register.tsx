// src/pages/Register.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [showVerify, setShowVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {}

      if (!res.ok) {
        const extractMessage = (d: any) => {
          if (!d) return `Registration failed (${res.status})`;
          if (typeof d === "string") return d;
          if (Array.isArray(d)) return d.map((it: any) => it?.msg || JSON.stringify(it)).join("; ");
          if (Array.isArray(d?.detail)) {
            return d.detail.map((it: any) => {
              if (typeof it === "string") return it;
              if (it?.msg) return it.msg;
              return JSON.stringify(it);
            }).join("; ");
          }
          if (typeof d.detail === "string") return d.detail;
          if (d?.message) return d.message;
          try { return JSON.stringify(d); } catch (e) { return String(d); }
        };

        const message = extractMessage(data);
        alert(message);
        return;
      }

      if (data?.email) {
        setRegisteredEmail(data.email);
        setShowVerify(true);
      } else {
        alert("Unexpected response from server");
      }
    } catch (err) {
      alert("Network error while registering. Check your connection and backend.");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = form.password === form.confirmPassword;
  const showPasswordError = form.confirmPassword.length > 0 && !passwordsMatch;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, code: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.detail || data.message || "Verification failed");
        return;
      }
      alert("Email verified! You can now log in.");
      setShowVerify(false);
      navigate("/login");
    } catch (err) {
      setVerifyError("Network error. Try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 py-8" style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex flex-col md:flex-row bg-gray-900 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl">
        {/* Left image section */}
        <div className="hidden md:block md:w-1/2 relative">
          <img src={registerImage} alt="Register" className="object-cover w-full h-full" />
          <img src={registerImage1} alt="Decor 1" className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-white shadow-lg" />
          <img src={registerImage2} alt="Decor 2" className="absolute bottom-4 right-4 w-20 h-20 rounded-full border-4 border-white shadow-lg" />
        </div>
        {/* Right form section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2 text-emerald-400">Create your account</h1>
          <p className="text-gray-400 mb-6">Find the best places with AI-powered search.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className={`bg-gray-800 border rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 ${showPasswordError ? 'border-red-500' : 'border-gray-700'}`}
              required
              minLength={6}
            />
            {showPasswordError && (
              <div className="text-red-400 text-xs">Passwords do not match</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded transition"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:underline">Log in</Link>
          </div>
        </div>
      </div>

      {/* Modal for email verification */}
      {showVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white text-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-xs relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowVerify(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-2 text-center">Verify your email</h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Enter the 6-digit code sent to <b>{registeredEmail}</b>
            </p>
            <form onSubmit={handleVerify} className="flex flex-col gap-3">
              <input
                type="text"
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value)}
                placeholder="Verification code"
                className="border px-3 py-2 rounded text-sm"
                required
                maxLength={6}
              />
              <button
                type="submit"
                disabled={verifyLoading}
                className="bg-emerald-500 text-white py-2 rounded font-semibold"
              >
                {verifyLoading ? "Verifying..." : "Verify"}
              </button>
              {verifyError && <div className="text-red-500 text-xs text-center">{verifyError}</div>}
            </form>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Didn&apos;t get the code? Check your spam folder or{" "}
              <button
                className="text-emerald-500 underline"
                type="button"
                onClick={async () => {
                  setVerifyError("");
                  setVerifyLoading(true);
                  try {
                    const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";
                    await fetch(`${API_BASE}/api/auth/register`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: form.name, email: registeredEmail, password: form.password }),
                    });
                    setVerifyError("Verification code resent!");
                  } catch {
                    setVerifyError("Failed to resend code.");
                  } finally {
                    setVerifyLoading(false);
                  }
                }}
              >
                resend
              </button>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}