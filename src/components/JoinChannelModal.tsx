"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { X, UserPlus, Loader2 } from "lucide-react";

export default function JoinChannelModal({ onClose }: { onClose: () => void }) {
  const joinChannel = useStore((s) => s.joinChannel);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    try {
      const ok = await joinChannel(code.trim());
      if (ok) onClose();
    } catch (e: any) {
      setError(e.message || "Could not join.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-lav-900/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-fade-in rounded-3xl bg-white p-6 text-lav-800 shadow-glow dark:bg-night-800 dark:text-lav-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <UserPlus size={18} /> Join a shared channel
          </h2>
          <button onClick={onClose} className="text-lav-400 hover:text-lav-600">
            <X size={20} />
          </button>
        </div>
        <p className="mb-4 text-sm text-lav-500">
          Paste the invite code someone shared with you. It unlocks their channel and starts
          syncing it into your sidebar.
        </p>
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="channelId~key…"
          className="w-full rounded-xl border border-lav-200 px-3.5 py-2.5 text-sm outline-none focus:border-lav-400 focus:ring-2 focus:ring-lav-200 dark:border-night-border dark:bg-night-700 dark:text-lav-100 dark:placeholder:text-lav-400"
        />
        {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !code.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-lav-500 to-lav-600 py-2.5 font-medium text-white shadow-glow transition hover:brightness-105 disabled:opacity-50"
        >
          {busy ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
          Join channel
        </button>
      </div>
    </div>
  );
}
