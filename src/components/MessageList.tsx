"use client";

import { useEffect, useMemo, useRef } from "react";
import { useStore } from "@/lib/store";
import type { Message } from "@/lib/types";
import { prettyDate } from "@/lib/date";
import MessageItem from "./MessageItem";
import { Star, Search, MessagesSquare } from "lucide-react";

export default function MessageList() {
  const days = useStore((s) => s.days);
  const view = useStore((s) => s.view);
  const activeChannel = useStore((s) => s.activeChannel);
  const searchQuery = useStore((s) => s.searchQuery);
  const showDividers = useStore((s) => s.settings.showDateDividers);
  const bottomRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    const all: Message[] = [];
    for (const date of Object.keys(days)) {
      for (const m of days[date]) {
        if (view === "channel" && m.channel !== activeChannel) continue;
        if (view === "starred" && !m.pinned) continue;
        if (view === "search") {
          const q = searchQuery.trim().toLowerCase();
          if (!q) continue;
          if (!m.text.toLowerCase().includes(q) && !m.channel.toLowerCase().includes(q)) continue;
        }
        all.push(m);
      }
    }
    all.sort((a, b) => a.ts - b.ts);
    const byDate: { date: string; items: Message[] }[] = [];
    for (const m of all) {
      let bucket = byDate.find((b) => b.date === m.date);
      if (!bucket) {
        bucket = { date: m.date, items: [] };
        byDate.push(bucket);
      }
      bucket.items.push(m);
    }
    byDate.sort((a, b) => a.date.localeCompare(b.date));
    return byDate;
  }, [days, view, activeChannel, searchQuery]);

  const total = grouped.reduce((n, g) => n + g.items.length, 0);

  useEffect(() => {
    if (view === "channel") bottomRef.current?.scrollIntoView();
  }, [total, view, activeChannel]);

  if (total === 0) return <EmptyState view={view} channel={activeChannel} query={searchQuery} />;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {grouped.map((g) => (
        <div key={g.date}>
          {showDividers && (
            <div className="sticky top-0 z-[1] my-3 flex items-center justify-center">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-lav-500 shadow-soft ring-1 ring-lav-200/60 backdrop-blur dark:bg-night-600/80 dark:text-lav-300 dark:ring-night-border">
                {prettyDate(g.date)}
              </span>
            </div>
          )}
          <div className="space-y-0.5">
            {g.items.map((m) => (
              <MessageItem key={m.id} message={m} showChannel={view !== "channel"} />
            ))}
          </div>
        </div>
      ))}
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}

function EmptyState({
  view,
  channel,
  query,
}: {
  view: string;
  channel: string;
  query: string;
}) {
  let icon = <MessagesSquare size={28} />;
  let title = `Welcome to #${channel}`;
  let sub = "This is the start of this channel. Say something below.";
  if (view === "starred") {
    icon = <Star size={28} />;
    title = "Nothing pinned yet";
    sub = "Hover a message and hit the star to keep important things here.";
  } else if (view === "search") {
    icon = <Search size={28} />;
    title = query ? "No matches" : "Search your vault";
    sub = query ? `Nothing found for “${query}”.` : "Type above to search across every channel and day.";
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center text-lav-400">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-lav-100 text-lav-500 dark:bg-night-700 dark:text-lav-300">
        {icon}
      </div>
      <p className="text-base font-medium text-lav-700 dark:text-lav-200">{title}</p>
      <p className="mt-1 max-w-xs text-sm">{sub}</p>
    </div>
  );
}
