import { useSearchParams, useNavigate } from "react-router-dom";

export default function Success() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const plan = params.get("plan");
  const isDev = sessionId?.startsWith("dev_mock");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060c18] flex items-center justify-center px-4 transition-colors duration-200">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-emerald-500 dark:text-emerald-400" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">Payment successful!</h1>
          <p className="text-[14px] text-gray-500 dark:text-white/45 mt-2">
            {isDev
              ? "This is a dev/demo checkout — no real charge was made."
              : "Thank you for subscribing. Your plan is now active."}
          </p>
        </div>

        {/* Session info */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-2xl px-5 py-4 text-left space-y-2 shadow-sm">
          {plan && (
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-500 dark:text-white/40">Plan</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold capitalize">
                {plan.includes("XXX") || plan.includes("demo") ? "Pro (Demo)" : plan}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-gray-500 dark:text-white/40">Session ID</span>
            <span className="text-gray-600 dark:text-white/60 font-mono text-[11px] truncate max-w-[200px]">
              {sessionId ?? "—"}
            </span>
          </div>
          {isDev && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
              <span className="text-[10px] font-bold bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                DEV MODE
              </span>
              <span className="text-[11px] text-gray-400 dark:text-white/30">Replace priceId with a real Stripe Price ID for production.</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-[14px] font-semibold transition-all shadow-lg shadow-emerald-500/20"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/[0.07] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-gray-700 dark:text-white/60 text-[14px] font-semibold transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
