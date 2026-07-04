"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Channel } from "@/lib/types";
import { Sparkles, Star, Plus, Settings, Hash, Users, Link2, UserPlus, RefreshCw } from "lucide-react";
import ChannelAccessModal from "./ChannelAccessModal";
import JoinChannelModal from "./JoinChannelModal";

export default function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const channels = useStore((s) => s.channels);
  const activeChannel = useStore((s) => s.activeChannel);
  const view = useStore((s) => s.view);
  const days = useStore((s) => s.days);
  const setActiveChannel = useStore((s) => s.setActiveChannel);
  const setView = useStore((s) => s.setView);
  const addChannel = useStore((s) => s.addChannel);
  const session = useStore((s) => s.session);
  const syncChannel = useStore((s) => s.syncChannel);
  const channelSync = useStore((s) => s.channelSync);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [accessChannel, setAccessChannel] = useState<Channel | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);

  const personal = channels.filter((c) => c.kind !== "shared");
  const shared = channels.filter((c) => c.kind === "shared");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    let pinned = 0;
    for (const date of Object.keys(days)) {
      for (const m of days[date]) {
        c[m.channel] = (c[m.channel] || 0) + 1;
        if (m.pinned) pinned++;
      }
    }
    return { c, pinned };
  }, [days]);

  async function submitChannel() {
    if (name.trim()) await addChannel(name);
    setName("");
    setAdding(false);
  }

  return (
    <aside className="flex w-64 flex-col bg-gradient-to-b from-lav-600 via-lav-600 to-lav-700 text-lav-50">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
          <Sparkles size={17} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Murmur</p>
          <p className="text-[11px] text-lav-200">{session?.displayName}</p>
        </div>
      </div>

      <div className="px-3">
        <button
          onClick={() => setView("starred")}
          className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition ${
            view === "starred" ? "bg-white/20 font-medium" : "hover:bg-white/10"
          }`}
        >
          <Star size={15} /> Pinned
          {counts.pinned > 0 && <span className="ml-auto text-xs text-lav-200">{counts.pinned}</span>}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {/* Personal */}
        <SectionHeader label="Channels" onAdd={() => setAdding(true)} />
        <div className="space-y-0.5">
          {personal.map((c) => (
            <ChannelRow
              key={c.id}
              c={c}
              active={view === "channel" && activeChannel === c.id}
              count={counts.c[c.id]}
              syncing={!!channelSync[c.id]}
              onSync={() => syncChannel(c.id)}
              onClick={() => setActiveChannel(c.id)}
              action={{ icon: <Link2 size={13} />, title: "Share channel", onClick: () => setAccessChannel(c) }}
            />
          ))}
          {adding && (
            <div className="px-1 pt-1">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitChannel();
                  if (e.key === "Escape") {
                    setAdding(false);
                    setName("");
                  }
                }}
                onBlur={submitChannel}
                placeholder="new-channel"
                className="w-full rounded-lg bg-white/15 px-2.5 py-1.5 text-sm text-white placeholder:text-lav-200 outline-none ring-1 ring-white/20 focus:ring-white/40"
              />
            </div>
          )}
        </div>

        {/* Shared */}
        <SectionHeader
          label="Shared"
          addIcon={<UserPlus size={15} />}
          addTitle="Join a channel"
          onAdd={() => setJoinOpen(true)}
        />
        {shared.length === 0 ? (
          <p className="px-2.5 py-1 text-[11px] text-lav-200/80">
            Share a channel or join with a code.
          </p>
        ) : (
          <div className="space-y-0.5">
            {shared.map((c) => (
              <ChannelRow
                key={c.id}
                c={c}
                active={view === "channel" && activeChannel === c.id}
                count={counts.c[c.id]}
                syncing={!!channelSync[c.id]}
                onSync={() => syncChannel(c.id)}
                onClick={() => setActiveChannel(c.id)}
                action={{
                  icon: <Users size={13} />,
                  title: "Channel access",
                  onClick: () => setAccessChannel(c),
                }}
              />
            ))}
          </div>
        )}
      </nav>

      <button
        onClick={onOpenSettings}
        className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-sm text-lav-100 transition hover:bg-white/10"
      >
        <Settings size={15} /> Settings
      </button>

      {accessChannel && (
        <ChannelAccessModal
          channelId={accessChannel.id}
          onClose={() => setAccessChannel(null)}
        />
      )}
      {joinOpen && <JoinChannelModal onClose={() => setJoinOpen(false)} />}
    </aside>
  );
}

function SectionHeader({
  label,
  onAdd,
  addIcon,
  addTitle,
}: {
  label: string;
  onAdd: () => void;
  addIcon?: React.ReactNode;
  addTitle?: string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between px-1 pb-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-lav-200">{label}</span>
      <button onClick={onAdd} title={addTitle} className="text-lav-200 hover:text-white">
        {addIcon || <Plus size={15} />}
      </button>
    </div>
  );
}

function ChannelRow({
  c,
  active,
  count,
  syncing,
  onSync,
  onClick,
  action,
}: {
  c: Channel;
  active: boolean;
  count?: number;
  syncing?: boolean;
  onSync: () => void;
  onClick: () => void;
  action: { icon: React.ReactNode; title: string; onClick: () => void };
}) {
  return (
    <div
      className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition ${
        active ? "bg-white/20 font-medium" : "text-lav-100 hover:bg-white/10"
      }`}
    >
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <span className="w-4 text-center text-lav-200">{c.emoji || <Hash size={14} />}</span>
        <span className="truncate">{c.name}</span>
      </button>
      <button
        onClick={onSync}
        title="Sync & reload"
        className={`text-lav-200 hover:text-white ${
          syncing ? "block" : "hidden group-hover:block"
        }`}
      >
        <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
      </button>
      <button
        onClick={action.onClick}
        title={action.title}
        className="hidden text-lav-200 hover:text-white group-hover:block"
      >
        {action.icon}
      </button>
      {count ? <span className="text-[11px] text-lav-200">{count}</span> : null}
    </div>
  );
}
