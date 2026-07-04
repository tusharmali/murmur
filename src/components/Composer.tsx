"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { SendHorizonal } from "lucide-react";

export default function Composer() {
  const send = useStore((s) => s.send);
  const channels = useStore((s) => s.channels);
  const activeChannel = useStore((s) => s.activeChannel);
  const enterToSend = useStore((s) => s.settings.enterToSend);
  const channel = channels.find((c) => c.id === activeChannel);

  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  async function submit() {
    const t = text.trim();
    if (!t) return;
    setText("");
    if (ref.current) ref.current.style.height = "auto";
    await send(t);
  }

  const hint = enterToSend
    ? "(Enter to send, Shift+Enter for a new line)"
    : "(Ctrl+Enter to send)";

  return (
    <div className="px-5 pb-5 pt-1">
      <div className="flex items-end gap-2 rounded-2xl border border-lav-200 bg-white p-2 shadow-soft focus-within:border-lav-400 focus-within:ring-2 focus-within:ring-lav-200 dark:border-night-border dark:bg-night-700">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
          }}
          onKeyDown={(e) => {
            const send = enterToSend
              ? e.key === "Enter" && !e.shiftKey
              : e.key === "Enter" && (e.ctrlKey || e.metaKey);
            if (send) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={`Message #${channel?.name || activeChannel}…  ${hint}`}
          className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-lav-400 dark:text-lav-100"
        />
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lav-500 to-lav-600 text-white shadow-glow transition hover:brightness-105 disabled:opacity-40"
        >
          <SendHorizonal size={17} />
        </button>
      </div>
    </div>
  );
}
