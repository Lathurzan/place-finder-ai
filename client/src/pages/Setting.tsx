import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { useTheme } from "../context/ThemeContext";

// ── Pricing plans data ─────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "Free forever",
    cta: "Get started free",
    featured: false,
    badge: null,
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
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "per month, billed annually",
    cta: "Start 14-day free trial",
    featured: true,
    badge: "Most popular",
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
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "tailored to your team",
    cta: "Contact sales",
    featured: false,
    badge: null,
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
] as const;

type PlanId = "starter" | "pro" | "enterprise";

// ── Manage Plan Modal ──────────────────────────────────────────
const ManagePlanModal = ({
  currentPlan,
  onClose,
  onPlanChange,
}: {
  currentPlan: PlanId;
  onClose: () => void;
  onPlanChange: (plan: PlanId) => void;
}) => {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [switching, setSwitching] = useState<PlanId | null>(null);

  const handleSwitch = (planId: PlanId) => {
    setSwitching(planId);
    setTimeout(() => {
      onPlanChange(planId);
      setSwitching(null);
    }, 800);
  };

  const handleCancel = () => {
    setConfirmCancel(false);
    onPlanChange("starter");
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[820px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0c1828] border border-white/[0.08] rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/[0.07]">
          <div>
            <h2 className="text-[18px] font-bold text-gray-900 dark:text-white">Manage your plan</h2>
            <p className="text-[13px] text-white/40 mt-0.5">
              You are currently on the{" "}
              <span className="text-emerald-400 font-semibold capitalize">{currentPlan}</span> plan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>
        </div>

        {/* Plans grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isActive = currentPlan === plan.id;
            const isLoading = switching === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl p-5 border transition-all duration-200 ${
                  plan.featured
                    ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.03] border-emerald-500/30"
                    : "bg-gray-50 dark:bg-white/[0.03] border-white/[0.07]"
                } ${isActive ? "ring-2 ring-emerald-500/50" : ""}`}
              >
                {/* Active badge */}
                {isActive && (
                  <span className="absolute -top-2.5 left-4 flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-black px-2.5 py-0.5 rounded-full">
                    ✓ Current plan
                  </span>
                )}

                {/* Popular badge */}
                {plan.badge && !isActive && (
                  <span className="inline-flex items-center self-start bg-emerald-400 text-[#022c22] text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full mb-3">
                    {plan.badge}
                  </span>
                )}
                {isActive && <div className="mb-3" />}

                {/* Plan name + price */}
                <div className="mb-1 text-[12px] font-semibold text-gray-500 dark:text-white/50 uppercase tracking-widest">
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-0.5">
                  <span className="text-[32px] font-extrabold text-white leading-none tracking-tight">
                    {plan.price}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 dark:text-white/35 mb-4">{plan.period}</div>

                <div className="h-px bg-white/[0.06] mb-4" />

                {/* Features */}
                <ul className="flex flex-col gap-2 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`flex items-center gap-2 text-[12px] ${f.included ? "text-white/70" : "text-white/25"}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        f.included
                          ? "bg-emerald-500/15 border border-emerald-500/30"
                          : "bg-white/[0.04] border border-gray-200 dark:border-white/10"
                      }`}>
                        {f.included && (
                          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                {isActive ? (
                  /* Current plan — show Cancel if paid */
                  plan.id !== "starter" ? (
                    confirmCancel ? (
                      <div className="space-y-2">
                        <p className="text-[11px] text-red-400/80 text-center">
                          Are you sure? You'll lose all {plan.name} features.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancel}
                            className="flex-1 py-2 rounded-lg text-[12px] font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            Yes, cancel
                          </button>
                          <button
                            onClick={() => setConfirmCancel(false)}
                            className="flex-1 py-2 rounded-lg text-[12px] font-semibold bg-gray-100 dark:bg-white/[0.05] border border-white/[0.08] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white/80 transition-all"
                          >
                            Keep plan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancel(true)}
                        className="w-full py-2.5 rounded-xl text-[12px] font-semibold border border-red-500/25 text-red-400 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/40 transition-all"
                      >
                        Cancel plan
                      </button>
                    )
                  ) : (
                    <div className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-center text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 cursor-default select-none">
                      ✓ Active
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => handleSwitch(plan.id as PlanId)}
                    disabled={isLoading}
                    className={`w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-150 ${
                      plan.featured
                        ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-sm shadow-emerald-500/30"
                        : "bg-gray-100 dark:bg-white/[0.05] border border-white/[0.08] text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:bg-white/[0.09] hover:text-gray-900 dark:hover:text-white/90"
                    } disabled:opacity-60`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Switching…
                      </span>
                    ) : plan.id === "enterprise" ? (
                      "Contact sales"
                    ) : (
                      `Switch to ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[11px] text-white/25">
            All plans include SSL security. Cancel anytime. Questions?{" "}
            <span className="text-emerald-400 cursor-pointer hover:text-emerald-300">Contact support →</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Types ─────────────────────────────────────────────────────
type SaveStatus = null | "saved" | "error";
type Tab = "account" | "preferences" | "security" | "danger";

// ── Sub-components ────────────────────────────────────────────

const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`
      bg-white dark:bg-[#0c1a2e]
      border border-gray-100 dark:border-white/[0.06]
      rounded-2xl overflow-hidden
      ${className}
    `}
  >
    {children}
  </div>
);

const SectionHead = ({
  title,
  desc,
}: {
  title: string;
  desc?: string;
}) => (
  <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
    <div className="text-[14px] font-semibold text-gray-900 dark:text-white">
      {title}
    </div>
    {desc && (
      <div className="text-[12px] text-gray-400 dark:text-white/40 mt-0.5">
        {desc}
      </div>
    )}
  </div>
);

const FieldRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-medium text-gray-500 dark:text-white/50">
      {label}
    </label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`
      w-full h-[38px] px-3 rounded-xl text-[13px] font-medium
      bg-gray-50 dark:bg-white/[0.04]
      border border-gray-200 dark:border-white/[0.07]
      text-gray-800 dark:text-white
      placeholder-gray-400 dark:placeholder-white/25
      outline-none
      focus:border-emerald-400 dark:focus:border-emerald-500
      focus:bg-white dark:focus:bg-white/[0.06]
      transition-all duration-150
      ${props.className ?? ""}
    `}
  />
);

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0
      ${checked
        ? "bg-emerald-500"
        : "bg-gray-200 dark:bg-white/[0.12]"
      }
    `}
  >
    <span
      className={`
        absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm
        transition-transform duration-200
        ${checked ? "translate-x-5" : "translate-x-0.5"}
      `}
    />
  </button>
);

const PrefRow = ({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-gray-50 dark:border-white/[0.04] last:border-none">
    <div>
      <div className="text-[13px] font-medium text-gray-800 dark:text-white/90">
        {title}
      </div>
      <div className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5">
        {desc}
      </div>
    </div>
    {children}
  </div>
);

// ── Avatar with upload hint ────────────────────────────────────
const AvatarUpload = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AJ";

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg select-none">
          {initials}
        </div>
        <div className="
          absolute inset-0 rounded-2xl bg-black/40
          flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer
        ">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
      </div>
      <div>
        <div className="text-[13px] font-semibold text-gray-800 dark:text-white">
          {name || "Alex Johnson"}
        </div>
        <button className="text-[11px] text-emerald-500 hover:text-emerald-600 font-medium mt-0.5 transition-colors">
          Change avatar
        </button>
      </div>
    </div>
  );
};

// ── Theme card ────────────────────────────────────────────────
const ThemeCard = ({
  mode,
  active,
  onClick,
}: {
  mode: "light" | "dark";
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      flex-1 rounded-xl border-2 overflow-hidden transition-all duration-150
      ${active
        ? "border-emerald-500 shadow-sm shadow-emerald-500/20"
        : "border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15]"
      }
    `}
  >
    {/* Preview */}
    <div className={`h-16 relative ${mode === "dark" ? "bg-gray-50 dark:bg-[#060c18]" : "bg-[#f5f3ef]"}`}>
      <div className={`
        absolute top-2.5 left-2.5 right-2.5 h-2 rounded
        ${mode === "dark" ? "bg-white/10" : "bg-gray-200"}
      `}/>
      <div className={`
        absolute top-6.5 left-2.5 w-8 h-1.5 rounded
        ${mode === "dark" ? "bg-white/6" : "bg-gray-100"}
      `}/>
      <div className={`
        absolute bottom-2 right-2.5 w-10 h-4 rounded-full
        ${mode === "dark" ? "bg-emerald-500/70" : "bg-emerald-400"}
      `}/>
    </div>
    <div className={`
      flex items-center justify-between px-3 py-2
      ${mode === "dark"
        ? "bg-[#0c1a2e] text-white/80"
        : "bg-white text-gray-700"
      }
    `}>
      <span className="text-[12px] font-medium capitalize">{mode}</span>
      {active && (
        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 5l2 2 4-4"/>
          </svg>
        </div>
      )}
    </div>
  </button>
);

// ── Nav tabs ──────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "account",
    label: "Account",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4"/><path d="M5 19a7 7 0 0114 0"/></svg>,
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  },
  {
    id: "security",
    label: "Security",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>,
  },
  {
    id: "danger",
    label: "Danger zone",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
];

// ── Main page ─────────────────────────────────────────────────
const Setting = () => {
  const { theme, toggle } = useTheme();

  const [tab, setTab]           = useState<Tab>("account");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [bio, setBio]           = useState("");
  const [lang, setLang]         = useState("en");
  const [notif, setNotif]       = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [mapDefault, setMapDefault] = useState("street");
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanId>("pro");
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pf_user");
      if (raw) {
        const u = JSON.parse(raw);
        setName(u.name || "Alex Johnson");
        setEmail(u.email || "alex@placefinder.ai");
      } else {
        setName("Alex Johnson");
        setEmail("alex@placefinder.ai");
      }
      const nf = localStorage.getItem("pf_notifications");
      if (nf !== null) setNotif(nf === "1");
    } catch {
      setName("Alex Johnson");
      setEmail("alex@placefinder.ai");
    }
  }, []);

  const save = () => {
    try {
      localStorage.setItem("pf_user", JSON.stringify({ name, email }));
      localStorage.setItem("pf_notifications", notif ? "1" : "0");
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <AppLayout>
      {/* Manage Plan Modal */}
      {showPlanModal && (
        <ManagePlanModal
          currentPlan={currentPlan}
          onClose={() => setShowPlanModal(false)}
          onPlanChange={(plan) => {
            setCurrentPlan(plan);
            setShowPlanModal(false);
          }}
        />
      )}
      <div className="p-5 max-w-[860px] mx-auto">

        {/* ── Page header ── */}
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-[13px] text-gray-400 dark:text-white/40 mt-0.5">
            Manage your account, preferences, and security.
          </p>
        </div>

        <div className="flex gap-5 items-start">

          {/* ── Left nav ── */}
          <nav className="
            hidden md:flex flex-col gap-0.5
            w-[180px] flex-shrink-0
            bg-white dark:bg-[#0c1a2e]
            border border-gray-100 dark:border-white/[0.06]
            rounded-2xl p-2
          ">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left
                  transition-all duration-150 text-[13px] font-medium
                  ${tab === t.id
                    ? t.id === "danger"
                      ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : t.id === "danger"
                      ? "text-red-400 dark:text-red-400/70 hover:bg-red-50/60 dark:hover:bg-red-500/8"
                      : "text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-800 dark:hover:text-gray-900 dark:hover:text-white/80"
                  }
                `}
              >
                <span className="flex-shrink-0">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          {/* ── Mobile tabs ── */}
          <div className="md:hidden w-full flex gap-1 mb-4 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap
                  text-[12px] font-medium transition-all flex-shrink-0
                  ${tab === t.id
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40"
                  }
                `}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Account tab */}
            {tab === "account" && (
              <>
                <SectionCard>
                  <SectionHead title="Profile" desc="Your public identity on Place Finder AI" />
                  <div className="p-5 space-y-4">
                    <AvatarUpload name={name} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <FieldRow label="Full name">
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Johnson"
                        />
                      </FieldRow>
                      <FieldRow label="Email address">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@domain.com"
                        />
                      </FieldRow>
                      <FieldRow label="Bio">
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us a little about yourself…"
                          rows={2}
                          className="
                            w-full px-3 py-2 rounded-xl text-[13px] font-medium
                            bg-gray-50 dark:bg-white/[0.04]
                            border border-gray-200 dark:border-white/[0.07]
                            text-gray-800 dark:text-white
                            placeholder-gray-400 dark:placeholder-white/25
                            outline-none resize-none
                            focus:border-emerald-400 dark:focus:border-emerald-500
                            focus:bg-white dark:focus:bg-white/[0.06]
                            transition-all duration-150
                          "
                        />
                      </FieldRow>
                      <FieldRow label="Language">
                        <select
                          value={lang}
                          onChange={(e) => setLang(e.target.value)}
                          className="
                            w-full h-[38px] px-3 rounded-xl text-[13px] font-medium
                            bg-gray-50 dark:bg-white/[0.04]
                            border border-gray-200 dark:border-white/[0.07]
                            text-gray-800 dark:text-white
                            outline-none cursor-pointer
                            focus:border-emerald-400 dark:focus:border-emerald-500
                            transition-all duration-150
                          "
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="es">Español</option>
                          <option value="ja">日本語</option>
                          <option value="ta">தமிழ்</option>
                        </select>
                      </FieldRow>
                    </div>
                  </div>
                </SectionCard>

                {/* Plan card */}
                <SectionCard>
                  <SectionHead title="Plan" desc="Your current subscription" />
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-gray-900 dark:text-white capitalize">
                          {currentPlan} plan
                        </div>
                        <div className="text-[12px] text-gray-400 dark:text-white/40">
                          {currentPlan === "pro"
                            ? "Unlimited searches · AI itineraries · Priority support"
                            : currentPlan === "enterprise"
                            ? "Everything in Pro · Team dashboard · API access"
                            : "10 AI searches/day · Basic map · 5 bookmarks"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPlanModal(true)}
                      className="
                        text-[12px] font-medium px-4 py-2 rounded-xl
                        border border-gray-200 dark:border-white/[0.08]
                        text-gray-600 dark:text-white/60
                        hover:bg-gray-50 dark:hover:bg-white/[0.04]
                        transition-colors
                      "
                    >
                      Manage plan
                    </button>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Preferences tab */}
            {tab === "preferences" && (
              <>
                {/* Appearance */}
                <SectionCard>
                  <SectionHead title="Appearance" desc="Choose your interface theme" />
                  <div className="p-5">
                    <div className="flex gap-3">
                      <ThemeCard
                        mode="light"
                        active={theme === "light"}
                        onClick={() => theme === "dark" && toggle()}
                      />
                      <ThemeCard
                        mode="dark"
                        active={theme === "dark"}
                        onClick={() => theme === "light" && toggle()}
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* Notifications */}
                <SectionCard>
                  <SectionHead title="Notifications" desc="Control what you hear from us" />
                  <div>
                    <PrefRow title="Place recommendations" desc="Get AI-suggested destinations based on your activity">
                      <Toggle checked={notif} onChange={setNotif} />
                    </PrefRow>
                    <PrefRow title="Weekly newsletter" desc="Travel inspiration delivered every Monday">
                      <Toggle checked={newsletter} onChange={setNewsletter} />
                    </PrefRow>
                  </div>
                </SectionCard>

                {/* Map default */}
                <SectionCard>
                  <SectionHead title="Map" desc="Default map view when opening Finder" />
                  <div className="p-5">
                    <div className="flex gap-2">
                      {["street", "satellite", "terrain"].map((v) => (
                        <button
                          key={v}
                          onClick={() => setMapDefault(v)}
                          className={`
                            flex-1 py-2 rounded-xl text-[12px] font-medium capitalize
                            border transition-all duration-150
                            ${mapDefault === v
                              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "border-gray-200 dark:border-white/[0.07] text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/[0.12]"
                            }
                          `}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Security tab */}
            {tab === "security" && (
              <SectionCard>
                <SectionHead title="Change password" desc="Use a strong password with letters, numbers, and symbols" />
                <div className="p-5 space-y-3">
                  <FieldRow label="Current password">
                    <Input
                      type="password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                    />
                  </FieldRow>
                  <FieldRow label="New password">
                    <Input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="••••••••"
                    />
                  </FieldRow>
                  <FieldRow label="Confirm new password">
                    <Input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                    />
                  </FieldRow>
                  {newPw && confirmPw && newPw !== confirmPw && (
                    <p className="text-[12px] text-red-500">Passwords do not match.</p>
                  )}
                  <button
                    disabled={!currentPw || !newPw || newPw !== confirmPw}
                    className="
                      mt-1 px-4 py-2 rounded-xl text-[13px] font-semibold
                      bg-emerald-500 text-white
                      hover:bg-emerald-600 disabled:opacity-40
                      transition-all duration-150
                    "
                  >
                    Update password
                  </button>
                </div>
              </SectionCard>
            )}

            {/* Danger zone tab */}
            {tab === "danger" && (
              <div className="
                bg-white dark:bg-[#0c1a2e]
                border-2 border-red-200 dark:border-red-500/20
                rounded-2xl overflow-hidden
              ">
                <div className="px-5 py-4 border-b border-red-100 dark:border-red-500/10 bg-red-50/50 dark:bg-red-500/5">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span className="text-[14px] font-semibold text-red-600 dark:text-red-400">
                      Danger zone
                    </span>
                  </div>
                  <p className="text-[12px] text-red-500/80 dark:text-red-400/60 mt-1">
                    These actions are permanent and cannot be undone.
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-red-100 dark:border-red-500/10 bg-red-50/30 dark:bg-red-500/5">
                    <div>
                      <div className="text-[13px] font-semibold text-gray-800 dark:text-white/90">
                        Delete account
                      </div>
                      <div className="text-[12px] text-gray-400 dark:text-white/40 mt-0.5">
                        Permanently remove your account, all bookmarks, and itineraries.
                      </div>
                    </div>
                    <button className="
                      flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold
                      border border-red-300 dark:border-red-500/30
                      text-red-600 dark:text-red-400
                      hover:bg-red-500 hover:text-white hover:border-red-500
                      transition-all duration-150
                    ">
                      Delete
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-white/[0.05]">
                    <div>
                      <div className="text-[13px] font-semibold text-gray-800 dark:text-white/90">
                        Export my data
                      </div>
                      <div className="text-[12px] text-gray-400 dark:text-white/40 mt-0.5">
                        Download a copy of all your bookmarks, searches, and itineraries.
                      </div>
                    </div>
                    <button className="
                      flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold
                      border border-gray-200 dark:border-white/[0.08]
                      text-gray-600 dark:text-white/60
                      hover:bg-gray-50 dark:hover:bg-white/[0.04]
                      transition-all duration-150
                    ">
                      Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Save button (account + preferences) ── */}
            {(tab === "account" || tab === "preferences") && (
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={save}
                  className="
                    px-5 py-2.5 rounded-xl text-[13px] font-semibold
                    bg-emerald-500 hover:bg-emerald-600
                    text-white shadow-sm shadow-emerald-500/20
                    active:scale-[0.98] transition-all duration-150
                  "
                >
                  Save changes
                </button>

                {saveStatus === "saved" && (
                  <div className="flex items-center gap-1.5 text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Saved
                  </div>
                )}
                {saveStatus === "error" && (
                  <div className="text-[13px] text-red-500 font-medium">
                    Something went wrong.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Setting;