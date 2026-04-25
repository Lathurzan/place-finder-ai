import { useEffect, useState } from "react";
import axios from "axios";

type Notification = {
  id: number;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    if (open) {
      axios.get("/api/notifications", { withCredentials: true }).then(res => setNotifs(res.data));
    }
  }, [open]);

  const markRead = (id: number) => {
    axios.post(`/api/notifications/mark-read/${id}`, {}, { withCredentials: true }).then(() => {
      setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    });
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-[#060c18] text-gray-500 dark:text-white/70 relative"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-[#060c18]"/>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#101a28] border border-gray-100 dark:border-white/10 rounded-2xl shadow-lg z-50">
          <div className="p-3 border-b border-gray-100 dark:border-white/10 font-semibold text-gray-800 dark:text-white">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 && <div className="p-4 text-gray-400 text-sm">No notifications</div>}
            {notifs.map(n => (
              <div key={n.id} className={`p-3 border-b border-gray-50 dark:border-white/5 ${n.read ? 'bg-gray-50 dark:bg-white/5' : 'bg-emerald-50/30 dark:bg-emerald-500/10'}`}>
                <div className="text-[13px] text-gray-800 dark:text-white">{n.message}</div>
                <div className="text-[11px] text-gray-400 dark:text-white/40">{new Date(n.created_at).toLocaleString()}</div>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-xs text-emerald-500 mt-1">Mark as read</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
