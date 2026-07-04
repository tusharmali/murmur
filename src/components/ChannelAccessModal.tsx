"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import {
  X,
  Users,
  Link2,
  Copy,
  Check,
  Crown,
  Trash2,
  UserPlus,
  Loader2,
  ShieldCheck,
  LogOut,
} from "lucide-react";

export default function ChannelAccessModal({
  channelId,
  onClose,
}: {
  channelId: string;
  onClose: () => void;
}) {
  // Sharing a personal channel migrates it to a new (uuid) id; track the live id
  // so the modal stays open on the freshly-shared channel.
  const [cid, setCid] = useState(channelId);
  const channel = useStore((s) => s.channels.find((c) => c.id === cid));
  const session = useStore((s) => s.session);
  const shareChannel = useStore((s) => s.shareChannel);
  const getInviteCode = useStore((s) => s.getInviteCode);
  const addMember = useStore((s) => s.addMember);
  const removeMember = useStore((s) => s.removeMember);
  const unshareChannel = useStore((s) => s.unshareChannel);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newMember, setNewMember] = useState("");

  const isShared = channel?.kind === "shared";
  const isOwner = !!channel?.isOwner;

  useEffect(() => {
    if (isShared) setCode(getInviteCode(cid));
  }, [isShared, cid, getInviteCode]);

  if (!channel) return null;

  async function doShare() {
    setBusy(true);
    setError("");
    try {
      const c = await shareChannel(cid);
      if (c) {
        setCode(c);
        setCid(c.slice(0, c.indexOf("~"))); // follow the migrated channel id
      }
    } catch (e: any) {
      setError(e.message || "Could not share.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  async function add() {
    if (!newMember.trim()) return;
    setBusy(true);
    setError("");
    const err = await addMember(cid, newMember.trim());
    if (err) setError(err);
    else setNewMember("");
    setBusy(false);
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
            {isShared ? <Users size={18} /> : <Link2 size={18} />}
            <span className="truncate">#{channel.name}</span>
          </h2>
          <button onClick={onClose} className="text-lav-400 hover:text-lav-600">
            <X size={20} />
          </button>
        </div>

        {!isShared ? (
          <>
            <p className="mb-4 text-sm text-lav-500">
              Share this channel to let others read and post. Its messages live in{" "}
              <b>your</b> sheet; people you invite connect through an encrypted invite code.
            </p>
            <button
              onClick={doShare}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-lav-500 to-lav-600 py-2.5 font-medium text-white shadow-glow transition hover:brightness-105 disabled:opacity-50"
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Link2 size={18} />}
              Share this channel
            </button>
          </>
        ) : (
          <>
            {code && (
              <div className="mb-4 rounded-2xl bg-lav-50 p-3.5 ring-1 ring-lav-200/60 dark:bg-night-700/50 dark:ring-night-border">
                <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-lav-400">
                  <ShieldCheck size={12} /> Invite code {isOwner ? "" : "(from your join)"}
                </p>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-2.5 py-2 text-xs text-lav-600 ring-1 ring-lav-200 dark:bg-night-800 dark:text-lav-300 dark:ring-night-border">
                    {code}
                  </code>
                  <button
                    onClick={copy}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lav-500 text-white hover:bg-lav-600"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-lav-400">
                  Anyone you give this code to (and who has a Murmur account) can join.
                </p>
              </div>
            )}

            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-lav-700">
                Access · {channel.members?.length || 0}
              </p>
              {isOwner && <span className="text-[11px] text-lav-400">you own this</span>}
            </div>

            <ul className="mb-3 max-h-44 space-y-1 overflow-y-auto">
              {(channel.members || []).map((m) => {
                const owner = m.toLowerCase() === channel.ownerEmail?.toLowerCase();
                const me = m.toLowerCase() === session?.email.toLowerCase();
                return (
                  <li
                    key={m}
                    className="flex items-center gap-2 rounded-xl bg-lav-50 px-3 py-2 text-sm dark:bg-night-700/50"
                  >
                    {owner ? (
                      <Crown size={14} className="text-amber-500" />
                    ) : (
                      <Users size={14} className="text-lav-400" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-lav-700">
                      {m} {me && <span className="text-lav-400">(you)</span>}
                    </span>
                    {isOwner && !owner && (
                      <button
                        onClick={() => removeMember(cid, m)}
                        title="Remove access"
                        className="text-lav-400 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {isOwner && (
              <div className="flex gap-2">
                <input
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && add()}
                  placeholder="add by email…"
                  className="flex-1 rounded-xl border border-lav-200 px-3 py-2 text-sm outline-none focus:border-lav-400 focus:ring-2 focus:ring-lav-200 dark:border-night-border dark:bg-night-700 dark:text-lav-100 dark:placeholder:text-lav-400"
                />
                <button
                  onClick={add}
                  disabled={busy}
                  className="flex items-center gap-1 rounded-xl bg-lav-500 px-3 py-2 text-sm font-medium text-white hover:bg-lav-600 disabled:opacity-50"
                >
                  <UserPlus size={15} /> Add
                </button>
              </div>
            )}

            <button
              onClick={async () => {
                await unshareChannel(cid);
                onClose();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
            >
              <LogOut size={15} /> {isOwner ? "Stop sharing this channel" : "Leave channel"}
            </button>
          </>
        )}

        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      </div>
    </div>
  );
}
