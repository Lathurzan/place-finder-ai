import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/* ── Field wrapper — defined OUTSIDE component to prevent remount on every keystroke ── */
function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-[#aab4c4] tracking-wide uppercase">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}

/* ── Card brand badge — defined OUTSIDE component ── */
function BrandBadge({ brand }: { brand: string | null }) {
  if (!brand) return <span className="text-[11px] text-white/20 font-medium">CARD</span>;
  const colors: Record<string, string> = {
    visa:       "text-blue-400",
    mastercard: "text-red-400",
    amex:       "text-sky-400",
    discover:   "text-orange-400",
  };
  return (
    <span className={`text-[12px] font-bold uppercase tracking-wide ${colors[brand]}`}>
      {brand}
    </span>
  );
}

/* ── helpers ── */
const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + " / " + digits.slice(2);
};

const PLAN_LABELS: Record<string, { name: string; price: string; desc: string }> = {
  starter:    { name: "Starter",    price: "$0",     desc: "Free forever" },
  pro:        { name: "Pro",        price: "$12",    desc: "per month, billed annually" },
  enterprise: { name: "Enterprise", price: "Custom", desc: "Tailored to your team" },
};

export default function Checkout() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const planKey   = params.get("plan") ?? "pro";
  const plan      = PLAN_LABELS[planKey] ?? PLAN_LABELS.pro;

  const [email,      setEmail]      = useState("");
  const [cardName,   setCardName]   = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [cvc,        setCvc]        = useState("");
  const [zip,        setZip]        = useState("");
  const [paying,     setPaying]     = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [cardFocus,  setCardFocus]  = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => { emailRef.current?.focus(); }, []);

  /* card brand detection */
  const rawCard = cardNumber.replace(/\s/g, "");
  const brand =
    rawCard.startsWith("4")      ? "visa"       :
    /^5[1-5]/.test(rawCard)      ? "mastercard" :
    /^3[47]/.test(rawCard)       ? "amex"       :
    /^6(?:011|5)/.test(rawCard)  ? "discover"   : null;

  /* validation */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!email || !/\S+@\S+\.\S+/.test(email))
      e.email = "Valid email required";
    if (!cardName.trim())
      e.cardName = "Name on card required";
    if (rawCard.length < 13)
      e.cardNumber = "Invalid card number";

    // Parse expiry: strip spaces and slash
    const expiryDigits = expiry.replace(/[\s/]/g, "");
    const mm = parseInt(expiryDigits.slice(0, 2), 10);
    const yyRaw = expiryDigits.slice(2);
    if (expiryDigits.length < 4 || isNaN(mm) || mm < 1 || mm > 12 || yyRaw.length < 2)
      e.expiry = "Invalid expiry (MM / YY)";

    if (cvc.length < 3)
      e.cvc = "CVC too short";
    if (!zip.trim())
      e.zip = "ZIP / postal code required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setPaying(true);
    setTimeout(() => {
      navigate(`/success?session_id=dev_mock_${Date.now()}&plan=${planKey}`);
    }, 2000);
  };

  /* card brand badge */

  const inputCls = (key: string) =>
    `w-full h-11 px-3 rounded-lg text-[14px] font-medium outline-none transition-all duration-150
     bg-[#0d1f35] border text-white placeholder-white/20
     ${errors[key]
       ? "border-red-500/60 focus:border-red-400"
       : "border-[#1e3250] focus:border-[#3291ff]"
     }`;

  /* display price cleanly — strip any leading $ since we add it manually */
  const displayPrice = plan.price.replace(/^\$/, "");
  const isCustom     = plan.price === "Custom";

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[860px] flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden shadow-2xl border border-white/[0.06]">

        {/* LEFT: order summary */}
        <div className="md:w-[320px] flex-shrink-0 bg-[#060c18] border-b md:border-b-0 md:border-r border-white/[0.06] p-7 flex flex-col gap-6">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#635bff] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-[15px]">Place Finder AI</span>
          </div>

          <div>
            <p className="text-[12px] text-white/40 uppercase tracking-widest mb-1">Subscribe to</p>
            <h2 className="text-[26px] font-bold text-white">{plan.name} Plan</h2>
            <p className="text-[13px] text-white/40 mt-0.5">{plan.desc}</p>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-white/50">{plan.name} subscription</span>
              <span className="text-white font-semibold">
                {isCustom ? "Custom" : `$${displayPrice}/mo`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-white/50">14-day free trial</span>
              <span className="text-emerald-400 font-semibold">Free</span>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-white font-semibold">Due today</span>
              <span className="text-[18px] font-bold text-white">$0.00</span>
            </div>
            <p className="text-[11px] text-white/30 leading-relaxed">
              After your free trial, you'll be charged{" "}
              {isCustom ? "a custom rate" : `$${displayPrice}`} per month. Cancel anytime.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-white/25 mt-auto">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2"/>
              <path d="M8 11V7a4 4 0 018 0v4"/>
            </svg>
            Secured by Stripe · SSL encrypted
          </div>
        </div>

        {/* RIGHT: payment form */}
        <div className="flex-1 bg-[#0c1828] p-7 flex flex-col gap-5">

          <div>
            <h3 className="text-[18px] font-bold text-white">Pay with card</h3>
            <p className="text-[12px] text-white/35 mt-0.5">All fields are required</p>
          </div>

          <Field label="Email" error={errors.email}>
            <input
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls("email")}
            />
          </Field>

          <Field label="Card information" error={errors.cardNumber || errors.expiry || errors.cvc}>
            <div className={`rounded-lg border overflow-hidden transition-all duration-150 ${
              errors.cardNumber || errors.expiry || errors.cvc
                ? "border-red-500/60"
                : cardFocus ? "border-[#3291ff]" : "border-[#1e3250]"
            }`}>
              {/* Card number */}
              <div className="flex items-center bg-[#0d1f35] px-3 h-11 border-b border-[#1e3250]">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 1234 1234 1234"
                  value={cardNumber}
                  onFocus={() => setCardFocus(true)}
                  onBlur={() => setCardFocus(false)}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder-white/20 font-medium"
                />
                <div className="flex items-center gap-1.5 ml-2">
                  <BrandBadge brand={brand} />
                </div>
              </div>
              {/* Expiry + CVC */}
              <div className="flex">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM / YY"
                  value={expiry}
                  onFocus={() => setCardFocus(true)}
                  onBlur={() => setCardFocus(false)}
                  onChange={(e) => {
                    const prev = expiry;
                    const next = e.target.value;
                    // Allow backspacing through the separator naturally
                    const raw = next.replace(/[\s/]/g, "");
                    if (next.length < prev.length && raw.length <= 2) {
                      setExpiry(raw);
                    } else {
                      setExpiry(formatExpiry(next));
                    }
                  }}
                  className="flex-1 bg-[#0d1f35] h-11 px-3 outline-none text-[14px] text-white placeholder-white/20 font-medium border-r border-[#1e3250]"
                />
                <div className="flex items-center flex-1 bg-[#0d1f35] h-11 px-3 gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="CVC"
                    maxLength={4}
                    value={cvc}
                    onFocus={() => setCardFocus(true)}
                    onBlur={() => setCardFocus(false)}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder-white/20 font-medium"
                  />
                  <svg className="w-5 h-5 text-white/20 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <path d="M2 10h20"/>
                    <path d="M6 15h4" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </Field>

          <Field label="Name on card" error={errors.cardName}>
            <input
              type="text"
              placeholder="Full name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className={inputCls("cardName")}
            />
          </Field>

          <Field label="ZIP / Postal code" error={errors.zip}>
            <input
              type="text"
              placeholder="10001"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className={inputCls("zip")}
            />
          </Field>

          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full h-12 rounded-xl bg-[#635bff] hover:bg-[#4f46e5] disabled:opacity-60 text-white text-[15px] font-semibold transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-[#635bff]/20 active:scale-[0.99]"
          >
            {paying ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Processing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M8 11V7a4 4 0 018 0v4"/>
                </svg>
                {isCustom ? "Contact us" : `Subscribe — $${displayPrice}/mo after trial`}
              </>
            )}
          </button>

          <p className="text-[11px] text-white/20 text-center leading-relaxed">
            By confirming, you agree to our{" "}
            <span className="text-white/40 cursor-pointer hover:text-white/60">Terms of Service</span>{" "}
            and{" "}
            <span className="text-white/40 cursor-pointer hover:text-white/60">Privacy Policy</span>.
            You can cancel anytime from Settings.
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/20 mt-auto">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
            Powered by <span className="font-semibold text-white/30 ml-0.5">Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}