"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Message } from "@/lib/types";
import { prettyTime } from "@/lib/date";
import MessageBody from "./MessageBody";
import { Star, Pencil, Trash2, Copy, Check, X } from "lucide-react";

const AVATAR_COLORS = [
  "from-lav-400 to-lav-600",
  "from-pink-300 to-fuchsia-400",
  "from-sky-300 to-indigo-400",
  "from-emerald-300 to-teal-400",
  "from-amber-300 to-orange-400",
];

export default function MessageItem({
  message,
  showChannel,
}: {
  message: Message;
  showChannel?: boolean;
}) {
  const session = useStore((s) => s.session);
  const togglePin = useStore((s) => s.togglePin);
  const remove = useStore((s) => s.remove);
  const edit = useStore((s) => s.edit);
  const settings = useStore((s) => s.settings);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const [copied, setCopied] = useState(false);

  const name = message.author || session?.displayName || "You";
  const isMine = !message.authorEmail || message.authorEmail === session?.email;
  const color = AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  async function copy() {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function saveEdit() {
    await edit(message, draft);
    setEditing(false);
  }

  return (
    <div
      className={`msg-row group relative flex gap-3 rounded-xl px-2 py-1.5 transition hover:bg-lav-50 dark:hover:bg-night-700 ${
        message.pinned ? "bg-pastel-yellow/40 dark:bg-amber-400/10" : ""
      } ${settings.messageSeparators ? "border-b border-lav-100 dark:border-night-border/60" : ""}`}
    >
      {settings.showAvatars && (
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-sm font-semibold text-white`}
        >
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          {settings.showSenderNames && (
            <span className="text-sm font-semibold text-lav-800 dark:text-lav-100">{name}</span>
          )}
          <span className="text-[11px] text-lav-400">{prettyTime(message.ts, settings.timeFormat)}</span>
          {message.editedTs && <span className="text-[11px] text-lav-300">(edited)</span>}
          {showChannel && (
            <span className="rounded-md bg-lav-100 px-1.5 py-0.5 text-[10px] font-medium text-lav-500 dark:bg-night-600 dark:text-lav-300">
              #{message.channel}
            </span>
          )}
          {message.pinned && <Star size={12} className="text-amber-400" fill="currentColor" />}
        </div>

        {editing ? (
          <div className="mt-1">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                }
                if (e.key === "Escape") {
                  setDraft(message.text);
                  setEditing(false);
                }
              }}
              rows={Math.min(6, draft.split("\n").length)}
              className="w-full resize-none rounded-lg border border-lav-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lav-200 dark:border-night-border dark:bg-night-700 dark:text-lav-100"
            />
            <div className="mt-1.5 flex gap-2">
              <button
                onClick={saveEdit}
                className="flex items-center gap-1 rounded-lg bg-lav-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-lav-600"
              >
                <Check size={13} /> Save
              </button>
              <button
                onClick={() => {
                  setDraft(message.text);
                  setEditing(false);
                }}
                className="flex items-center gap-1 rounded-lg bg-lav-100 px-2.5 py-1 text-xs font-medium text-lav-600"
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="msg-text break-words">
            <MessageBody text={message.text} />
          </div>
        )}
      </div>

      {!editing && (
        <div className="absolute -top-3 right-3 hidden items-center gap-0.5 rounded-xl bg-white p-0.5 shadow-soft ring-1 ring-lav-200/70 group-hover:flex dark:bg-night-600 dark:ring-night-border">
          <IconBtn title="Copy" onClick={copy}>
            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          </IconBtn>
          <IconBtn title={message.pinned ? "Unpin" : "Pin"} onClick={() => togglePin(message)}>
            <Star
              size={15}
              className={message.pinned ? "text-amber-400" : ""}
              fill={message.pinned ? "currentColor" : "none"}
            />
          </IconBtn>
          {isMine && (
            <>
              <IconBtn title="Edit" onClick={() => setEditing(true)}>
                <Pencil size={15} />
              </IconBtn>
              <IconBtn title="Delete" onClick={() => remove(message)} danger>
                <Trash2 size={15} />
              </IconBtn>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-lg text-lav-500 transition hover:bg-lav-100 dark:text-lav-300 dark:hover:bg-night-700 ${
        danger ? "hover:bg-rose-100 hover:text-rose-500 dark:hover:bg-rose-500/20" : ""
      }`}
    >
      {children}
    </button>
  );
}

