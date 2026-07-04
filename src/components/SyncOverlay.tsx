"use client";

import { useStore } from "@/lib/store";
import { prettyDate } from "@/lib/date";
import { CloudDownload } from "lucide-react";

export default function SyncOverlay() {
  const initialSync = useStore((s) => s.initialSync);
  if (!initialSync.active) return null;

  const pct =
    initialSync.total > 0 ? Math.round((initialSync.done / initialSync.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-lav-900/40 backdrop-blur-md">
      <div className="w-full max-w-sm animate-fade-in rounded-3xl bg-white p-7 text-center shadow-glow">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lav-400 to-lav-600 text-white shadow-glow">
          <CloudDownload size={26} />
        </div>
        <h2 className="text-lg font-semibold text-lav-800">Syncing your vault</h2>
        <p className="mt-1 text-sm text-lav-500">
          Pulling your history from your private sheet, newest day first.
        </p>

        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-lav-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-lav-400 to-lav-600 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-lav-500">
          {initialSync.total === 0
            ? "Looking for your history…"
            : `${initialSync.done} / ${initialSync.total} days`}
          {initialSync.currentDate && (
            <span className="ml-1 text-lav-400">· {prettyDate(initialSync.currentDate)}</span>
          )}
        </p>
      </div>
    </div>
  );
}
