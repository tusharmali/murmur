"use client";

import { useStore } from "@/lib/store";
import type { AppSettings } from "@/lib/types";
import {
  X,
  RefreshCw,
  Download,
  LogOut,
  ShieldCheck,
  Link2,
  Palette,
  Monitor,
  Sun,
  Moon,
} from "lucide-react";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const session = useStore((s) => s.session);
  const logout = useStore((s) => s.logout);
  const runInitialSync = useStore((s) => s.runInitialSync);
  const exportAll = useStore((s) => s.exportAll);
  const pending = useStore((s) => s.pending);
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-lav-900/30 p-4 backdrop-blur-sm dark:bg-black/50"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-md animate-fade-in overflow-y-auto rounded-3xl bg-white p-6 shadow-glow dark:bg-night-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-lav-800 dark:text-lav-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-lav-400 hover:text-lav-600 dark:hover:text-lav-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* ---------------- Appearance ---------------- */}
          <Row label="Appearance" icon={<Palette size={12} />}>
            <Segmented
              label="Theme"
              value={settings.theme}
              onChange={(v) => setSetting("theme", v)}
              options={[
                { value: "system", label: "System", icon: <Monitor size={13} /> },
                { value: "light", label: "Light", icon: <Sun size={13} /> },
                { value: "dark", label: "Dark", icon: <Moon size={13} /> },
              ]}
            />
            <Segmented
              label="Message density"
              value={settings.density}
              onChange={(v) => setSetting("density", v)}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
            />
            <Segmented
              label="Text size"
              value={settings.fontScale}
              onChange={(v) => setSetting("fontScale", v)}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Default" },
                { value: "lg", label: "Large" },
              ]}
            />
            <Segmented
              label="Time format"
              value={settings.timeFormat}
              onChange={(v) => setSetting("timeFormat", v)}
              options={[
                { value: "12h", label: "12-hour" },
                { value: "24h", label: "24-hour" },
              ]}
            />

            <div className="mt-3 divide-y divide-lav-100 dark:divide-night-border/70">
              <Toggle
                label="Show avatars"
                checked={settings.showAvatars}
                onChange={(v) => setSetting("showAvatars", v)}
              />
              <Toggle
                label="Show sender names"
                checked={settings.showSenderNames}
                onChange={(v) => setSetting("showSenderNames", v)}
              />
              <Toggle
                label="Date dividers"
                checked={settings.showDateDividers}
                onChange={(v) => setSetting("showDateDividers", v)}
              />
              <Toggle
                label="Separators between messages"
                checked={settings.messageSeparators}
                onChange={(v) => setSetting("messageSeparators", v)}
              />
              <Toggle
                label="Press Enter to send"
                checked={settings.enterToSend}
                onChange={(v) => setSetting("enterToSend", v)}
              />
            </div>
            <p className="mt-2 text-[11px] text-lav-400">
              Saved on this device and synced to your sheet across devices.
            </p>
          </Row>

          {/* ---------------- Account ---------------- */}
          <Row label="Account">
            <p className="font-medium text-lav-700 dark:text-lav-200">{session?.displayName}</p>
            <p className="text-lav-400">{session?.email}</p>
          </Row>

          <Row label="Private database">
            <p className="flex items-center gap-1.5 text-lav-600 dark:text-lav-300">
              <Link2 size={13} /> {mask(session?.scriptUrl || "")}
            </p>
            <p className="text-lav-400">token: {mask(session?.token || "")}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={12} /> Connection encrypted; only your password can decrypt it.
            </p>
          </Row>

          {pending > 0 && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 py-2.5 font-medium text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-lav-50 p-3.5 ring-1 ring-lav-200/60 dark:bg-night-700/50 dark:ring-night-border">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-lav-400">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1.5 text-xs font-medium text-lav-600 dark:text-lav-300">{label}</p>
      <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-lav-200/70 dark:bg-night-800 dark:ring-night-border">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
              value === o.value
                ? "bg-gradient-to-br from-lav-500 to-lav-600 text-white shadow-soft"
                : "text-lav-500 hover:bg-lav-50 dark:text-lav-400 dark:hover:bg-night-700"
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between py-2.5 text-left"
    >
      <span className="text-sm text-lav-700 dark:text-lav-200">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-lav-500" : "bg-lav-200 dark:bg-night-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
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
      className="flex items-center justify-center gap-1.5 rounded-xl border border-lav-200 bg-white py-2.5 text-xs font-medium text-lav-600 transition hover:bg-lav-50 dark:border-night-border dark:bg-night-700 dark:text-lav-300 dark:hover:bg-night-600"
    >
      {icon} {children}
    </button>
  );
}
