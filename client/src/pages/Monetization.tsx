import { useState } from "react";

export default function Monetization() {
  const [referralCopied, setReferralCopied] = useState(false);
  const referralLink = `${window.location.origin}/register?ref=YOURCODE`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Monetization & Growth</h1>

      {/* Referral Program */}
      <div className="mb-8 p-4 border rounded-xl bg-white dark:bg-[#0b1528]">
        <h2 className="font-semibold mb-2">Referral Program</h2>
        <div className="mb-2">Invite friends and earn rewards when they sign up!</div>
        <div className="flex gap-2 items-center">
          <input value={referralLink} readOnly className="flex-1 border px-2 py-1 rounded" />
          <button onClick={copyReferral} className="bg-emerald-500 text-white px-3 py-1 rounded">
            {referralCopied ? "Copied!" : "Copy Link"}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">Share your link and get free Pro days for each signup.</div>
      </div>

      {/* Tiered Plans */}
      <div className="mb-8 p-4 border rounded-xl bg-white dark:bg-[#0b1528]">
        <h2 className="font-semibold mb-2">Tiered Plans</h2>
        <ul className="list-disc ml-6 text-sm">
          <li><b>Starter:</b> Basic features, limited AI searches, free forever.</li>
          <li><b>Pro:</b> Unlimited AI, image uploads, advanced maps, priority support.</li>
          <li><b>Enterprise:</b> Team dashboard, API access, SSO, custom integrations.</li>
        </ul>
        <div className="text-xs text-gray-500 mt-1">Upgrade anytime for more features.</div>
      </div>

      {/* Marketplace */}
      <div className="p-4 border rounded-xl bg-white dark:bg-[#0b1528]">
        <h2 className="font-semibold mb-2">Marketplace (Coming Soon)</h2>
        <div className="mb-2">Book hotels, tours, and experiences directly from PlaceFinder AI.</div>
        <button className="bg-blue-500 text-white px-3 py-1 rounded mt-2 opacity-60 cursor-not-allowed">Coming Soon</button>
      </div>
    </div>
  );
}
