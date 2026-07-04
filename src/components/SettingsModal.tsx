"use client";

import { useStore } from "@/lib/store";
import { X, RefreshCw, Download, LogOut, ShieldCheck, Link2 } from "lucide-react";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const session = useStore((s) => s.session);
  const logout = useStore((s) => s.logout);
  const runInitialSync = useStore((s) => s.runInitialSync);
  const exportAll = useStore((s) => s.exportAll);
  const pending = useStore((s) => s.pending);

  function mask(s: string) {
    if (!s) return "";
    if (s.length <= 12) return "•".repeat(s.length);
    return s.slice(0, 8) + "…" + s.slice(-6);
  }

  function download() {
    const blob = new Blob([exportAll()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `murmur-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-lav-900/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-fade-in rounded-3xl bg-white p-6 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-lav-800">Settings</h2>
          <button onClick={onClose} className="text-lav-400 hover:text-lav-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <Row label="Account">
            <p className="font-medium text-lav-700">{session?.displayName}</p>
            <p className="text-lav-400">{session?.email}</p>
          </Row>

          <Row label="Private database">
            <p className="flex items-center gap-1.5 text-lav-600">
              <Link2 size={13} /> {mask(session?.scriptUrl || "")}
            </p>
            <p className="text-lav-400">token: {mask(session?.token || "")}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
              <ShieldCheck size={12} /> Connection encrypted; only your password can decrypt it.
            </p>
          </Row>

          {pending > 0 && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-600">
              {pending} change{pending > 1 ? "s" : ""} waiting to sync to your sheet.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Action onClick={() => { runInitialSync(); onClose(); }} icon={<RefreshCw size={15} />}>
              Re-sync from sheet
            </Action>
            <Action onClick={download} icon={<Download size={15} />}>
              Export JSON
            </Action>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 py-2.5 font-medium text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-lav-50 p-3.5 ring-1 ring-lav-200/60">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-lav-400">{label}</p>
      {children}
    </div>
  );
}

function Action({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 rounded-xl border border-lav-200 bg-white py-2.5 text-xs font-medium text-lav-600 transition hover:bg-lav-50"
    >
      {icon} {children}
    </button>
  );
}
