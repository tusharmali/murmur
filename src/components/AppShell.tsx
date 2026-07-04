"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/date";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import Composer from "./Composer";
import SettingsModal from "./SettingsModal";
import { Search, Hash, Star, X, CloudOff, RefreshCw, Check, Users } from "lucide-react";

export default function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const view = useStore((s) => s.view);
  const channels = useStore((s) => s.channels);
  const activeChannel = useStore((s) => s.activeChannel);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearch = useStore((s) => s.setSearch);
  const syncChannel = useStore((s) => s.syncChannel);
  const channelSync = useStore((s) => s.channelSync);

  const channel = channels.find((c) => c.id === activeChannel);
  const syncing = !!channelSync[activeChannel];

  let title = "";
  let icon = <Hash size={18} />;
  if (view === "starred") {
    title = "Pinned & important";
    icon = <Star size={18} />;
  } else if (view === "search") {
    title = `Search`;
    icon = <Search size={18} />;
  } else {
    title = channel?.name || activeChannel;
    icon = <span className="text-lav-400">{channel?.emoji || "#"}</span>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="glass z-10 flex items-center gap-3 border-b border-lav-200/60 px-5 py-3">
          <div className="flex items-center gap-2 font-semibold text-lav-800">
            {icon}
            <span>{title}</span>
          </div>
          {view === "channel" && channel?.kind === "shared" && (
            <span className="flex items-center gap-1 rounded-full bg-lav-100 px-2.5 py-1 text-xs font-medium text-lav-600">
              <Users size={12} /> shared · {channel.members?.length || 1}
            </span>
          )}
          {view === "channel" && (
            <button
              onClick={() => syncChannel(activeChannel)}
              disabled={syncing}
              title="Sync & reload this channel"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-lav-600 transition hover:bg-lav-100 disabled:opacity-60"
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : "Sync"}
            </button>
          )}
          <SyncBadge />
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lav-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search everything…"
                className="w-56 rounded-xl border border-lav-200 bg-white/70 py-2 pl-9 pr-8 text-sm outline-none focus:border-lav-400 focus:ring-2 focus:ring-lav-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-lav-400 hover:text-lav-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </header>

        <MessageList />

        {view === "channel" && <Composer />}
      </main>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

function SyncBadge() {
  const sync = useStore((s) => s.sync);
  const pending = useStore((s) => s.pending);
  const activeChannel = useStore((s) => s.activeChannel);
  const pulling = useStore((s) => !!s.channelSync[s.activeChannel]);
  const last = useStore((s) => s.lastSynced[activeChannel]);

  // Re-render periodically so the "· 2m ago" label stays fresh.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  if (sync === "offline" || sync === "error")
    return (
      <Badge tone="rose">
        <CloudOff size={13} /> Offline{pending > 0 ? ` · ${pending} queued` : ""}
      </Badge>
    );
  if (sync === "syncing")
    return (
      <Badge tone="lav">
        <RefreshCw size={13} className="animate-spin" /> Saving…
      </Badge>
    );
  if (pulling)
    return (
      <Badge tone="lav">
        <RefreshCw size={13} className="animate-spin" /> Syncing…
      </Badge>
    );
  if (pending > 0)
    return (
      <Badge tone="amber">
        <RefreshCw size={13} /> {pending} queued
      </Badge>
    );
  return (
    <Badge tone="emerald">
      <Check size={13} /> Saved{last ? ` · ${timeAgo(last)}` : ""}
    </Badge>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "rose" | "lav" | "amber" | "emerald";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    rose: "bg-rose-100 text-rose-600",
    lav: "bg-lav-100 text-lav-600",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-600",
  };
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
