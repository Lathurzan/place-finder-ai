import { useRef, useState } from "react";
import axios from "axios";

export default function AvatarUpload({ avatarUrl, onUploaded }: { avatarUrl?: string; onUploaded: (url: string) => void }) {
  const [preview, setPreview] = useState<string | undefined>(avatarUrl);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await axios.post("/api/auth/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      onUploaded(res.data.avatar_url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <img
          src={preview || "/default-avatar.png"}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-white/20"
        />
        <button
          className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700"
          onClick={() => fileRef.current?.click()}
          type="button"
          aria-label="Change avatar"
        >
          <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 13v3h3l8-8-3-3-8 8z"/><path d="M14.5 6.5l-3-3"/></svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {loading && <span className="text-xs text-gray-500">Uploading...</span>}
    </div>
  );
}
