import { useState } from "react";
import axios from "axios";

export default function ItineraryCollaborators({ itineraryId, collaborators, onInvited }: {
  itineraryId: number;
  collaborators: { id: number; email: string }[];
  onInvited: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const invite = async () => {
    setStatus(null);
    try {
      await axios.post(`/api/itineraries/${itineraryId}/invite`, { email }, { withCredentials: true });
      setStatus("Invited!");
      onInvited(email);
      setEmail("");
    } catch (e: any) {
      setStatus(e.response?.data?.detail || "Error");
    }
  };

  return (
    <div>
      <div className="mb-2 font-semibold">Collaborators:</div>
      <ul className="mb-2">
        {collaborators.map(c => (
          <li key={c.id} className="text-sm text-gray-700 dark:text-white">{c.email}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Friend's email"
          className="border px-2 py-1 rounded"
        />
        <button onClick={invite} className="bg-emerald-500 text-white px-3 py-1 rounded">Invite</button>
      </div>
      {status && <div className="text-xs mt-1">{status}</div>}
    </div>
  );
}
