// src/components/PricingSection.tsx
"use client";

import { useState } from "react";

interface Plan {
  name: string;
  price: string;
  period: string;
  features: { text: string; included: boolean }[];
  cta: string;
  featured?: boolean;
  badge?: string;
  priceId: string | null; // null = free plan, no checkout needed
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    period: "Free forever",
    cta: "Get started free",
    priceId: null, // No Stripe needed — redirect to signup
    features: [
      { text: "10 AI searches per day", included: true },
      { text: "Image upload (3/day)", included: true },
      { text: "Basic map view", included: true },
      { text: "5 bookmarks", included: true },
      { text: "Smart itineraries", included: false },
      { text: "Voice search", included: false },
      { text: "Weather insights", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month, billed annually",
    cta: "Start 14-day free trial",
    featured: true,
    badge: "Most popular",
    priceId: "price_XXXXXXXXXXXXXXXX", // 👈 Replace with your Stripe Price ID
    features: [
      { text: "Unlimited AI searches", included: true },
      { text: "Unlimited image uploads", included: true },
      { text: "Full interactive map", included: true },
      { text: "Unlimited bookmarks", included: true },
      { text: "Smart itineraries", included: true },
      { text: "Voice search", included: true },
      { text: "Live weather insights", included: true },
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "tailored to your team",
    cta: "Contact sales",
    priceId: "contact", // Special case — redirect to contact form
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Team dashboard", included: true },
      { text: "API access", included: true },
      { text: "SSO & custom auth", included: true },
      { text: "Priority AI processing", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom integrations", included: true },
    ],
  },
];

export default function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlanClick = async (plan: Plan) => {
    setError(null);

    // Free plan → redirect to your signup page
    if (plan.priceId === null) {
      window.location.href = "/signup";
      return;
    }

    // Enterprise → redirect to contact form
    if (plan.priceId === "contact") {
      window.location.href = "/contact";
      return;
    }

    // Paid plan → create Stripe Checkout Session
    setLoadingPlan(plan.name);

    try {
      const res = await fetch("http://localhost:8000/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      const { url } = await res.json();

      if (!url) throw new Error("No checkout URL returned.");

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-24 px-6 bg-[#0c1626]">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="mb-14">
          <p className="text-[11px] font-semibold tracking-[.12em] uppercase text-emerald-400 mb-3">
            Pricing
          </p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-white tracking-[-1px] mb-4 font-['Syne']">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-slate-400 max-w-md">
            Start free. Upgrade when you're ready to explore more.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[400px] md:max-w-none mx-auto">
          {plans.map((plan) => {
            const isLoading = loadingPlan === plan.name;

            return (
              <div
                key={plan.name}
                className={`flex flex-col rounded-[20px] p-8 border transition-transform duration-200 hover:-translate-y-1 ${
                  plan.featured
                    ? "bg-gradient-to-br from-emerald-400/12 to-emerald-400/4 border-emerald-400/35"
                    : "bg-white/[0.04] border-white/8"
                }`}
              >
                {plan.badge && (
                  <span className="inline-flex items-center bg-emerald-400 text-[#022c22] text-[10px] font-bold tracking-[.08em] uppercase px-2.5 py-1 rounded-full mb-5 w-fit">
                    {plan.badge}
                  </span>
                )}
                <div className="text-sm font-semibold text-slate-400 mb-2 font-['Syne']">
                  {plan.name}
                </div>
                <div
                  className={`font-extrabold text-white tracking-[-2px] mb-1 font-['Syne'] ${
                    plan.price === "Custom" ? "text-[32px]" : "text-[44px]"
                  }`}
                >
                  {plan.price !== "Custom" && (
                    <sup className="text-xl align-top mt-2.5">$</sup>
                  )}
                  {plan.price === "Custom" ? "Custom" : plan.price.replace("$", "")}
                </div>
                <div className="text-xs text-slate-500 mb-6">{plan.period}</div>
                <div className="h-px bg-white/8 mb-6" />

                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-center gap-2.5 text-[13px] ${
                        f.included ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                          f.included
                            ? "bg-emerald-400/15 border border-emerald-400/30"
                            : "bg-white/5 border border-white/10"
                        }`}
                      >
                        {f.included && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M2 5l2 2 4-4"
                              stroke="#34d399"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanClick(plan)}
                  disabled={isLoading}
                  className={`mt-7 block w-full text-center py-3 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.featured
                      ? "bg-emerald-400 text-[#022c22] font-semibold hover:bg-emerald-300"
                      : "bg-transparent border border-white/8 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {isLoading ? "Redirecting…" : plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}