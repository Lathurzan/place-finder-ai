import { useState } from "react";

export default function ItineraryShare({ itineraryId }: { itineraryId: number }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/itinerary/${itineraryId}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all"
    >
      {copied ? "Link Copied!" : "Share Link"}
    </button>
  );
}
