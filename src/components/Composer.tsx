"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import {
  SendHorizonal,
  Bold,
  Italic,
  Strikethrough,
  Link2,
  Code,
  Code2,
  List,
  Quote,
  Image as ImageIcon,
  Upload,
  Loader2,
  X,
} from "lucide-react";

export default function Composer() {
  const send = useStore((s) => s.send);
  const channels = useStore((s) => s.channels);
  const activeChannel = useStore((s) => s.activeChannel);
  const enterToSend = useStore((s) => s.settings.enterToSend);
  const uploadImage = useStore((s) => s.uploadImage);
  const channel = channels.find((c) => c.id === activeChannel);

  const [text, setText] = useState("");
  const [imgOpen, setImgOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function autosize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  /** Wrap the current selection (or insert a placeholder) with markdown. */
  function wrap(before: string, after = before, placeholder = "text") {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = text.slice(start, end) || placeholder;
    const next = text.slice(0, start) + before + sel + after + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + sel.length;
      autosize();
    });
  }

  /** Prefix each selected line (lists, quotes). */
  function prefixLines(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const block = text.slice(lineStart, end) || "item";
    const prefixed = block
      .split("\n")
      .map((l) => (l.startsWith(prefix) ? l : prefix + l))
      .join("\n");
    setText(text.slice(0, lineStart) + prefixed + text.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      autosize();
    });
  }

  function insert(snippet: string) {
    const el = ref.current;
    const start = el ? el.selectionStart : text.length;
    const end = el ? el.selectionEnd : text.length;
    setText(text.slice(0, start) + snippet + text.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      autosize();
    });
  }

  async function submit() {
    const t = text.trim();
    if (!t) return;
    setText("");
    if (ref.current) ref.current.style.height = "auto";
    await send(t);
  }

  function addImageUrl() {
    const u = imgUrl.trim();
    if (!u) return;
    insert(`![image](${u})`);
    setImgUrl("");
    setImgOpen(false);
  }

  async function onPickFile(file?: File | null) {
    if (!file) return;
    setErr("");
    if (!file.type.startsWith("image/")) return setErr("That's not an image file.");
    if (file.size > 5 * 1024 * 1024) return setErr("Image must be under 5 MB.");
    setBusy(true);
    try {
      const url = await uploadImage(file);
      insert(`![${file.name}](${url})`);
      setImgOpen(false);
    } catch (e: any) {
      setErr(e?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  const hint = enterToSend
    ? "(Enter to send, Shift+Enter for a new line)"
    : "(Ctrl+Enter to send)";

  return (
    <div className="relative px-5 pb-5 pt-1">
      {imgOpen && (
        <ImagePopover
          url={imgUrl}
          setUrl={setImgUrl}
          onAdd={addImageUrl}
          onUpload={() => fileRef.current?.click()}
          onClose={() => {
            setImgOpen(false);
            setErr("");
          }}
          busy={busy}
          err={err}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onPickFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div className="rounded-2xl border border-lav-200 bg-white shadow-soft focus-within:border-lav-400 focus-within:ring-2 focus-within:ring-lav-200 dark:border-night-border dark:bg-night-700">
        {/* Formatting toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-lav-100 px-2 py-1 dark:border-night-border">
          <Tool title="Bold  (**text**)" onClick={() => wrap("**")}>
            <Bold size={14} />
          </Tool>
          <Tool title="Italic  (*text*)" onClick={() => wrap("*")}>
            <Italic size={14} />
          </Tool>
          <Tool title="Strikethrough  (~~text~~)" onClick={() => wrap("~~")}>
            <Strikethrough size={14} />
          </Tool>
          <Divider />
          <Tool title="Link  [text](url)" onClick={() => wrap("[", "](https://)", "link")}>
            <Link2 size={14} />
          </Tool>
          <Tool title="Inline code  (`code`)" onClick={() => wrap("`", "`", "code")}>
            <Code size={14} />
          </Tool>
          <Tool title="Code block" onClick={() => wrap("\n```\n", "\n```\n", "code")}>
            <Code2 size={14} />
          </Tool>
          <Divider />
          <Tool title="Bulleted list" onClick={() => prefixLines("- ")}>
            <List size={14} />
          </Tool>
          <Tool title="Quote" onClick={() => prefixLines("> ")}>
            <Quote size={14} />
          </Tool>
          <Divider />
          <Tool title="Insert image" onClick={() => setImgOpen((o) => !o)} active={imgOpen}>
            <ImageIcon size={14} />
          </Tool>
          <span className="ml-auto hidden pr-1 text-[10px] text-lav-400 sm:block">
            Markdown supported
          </span>
        </div>

        <div className="flex items-end gap-2 p-2">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              autosize();
            }}
            onKeyDown={(e) => {
              const doSend = enterToSend
                ? e.key === "Enter" && !e.shiftKey
                : e.key === "Enter" && (e.ctrlKey || e.metaKey);
              if (doSend) {
                e.preventDefault();
                submit();
                return;
              }
              // Familiar shortcuts
              if (e.ctrlKey || e.metaKey) {
                if (e.key === "b") {
                  e.preventDefault();
                  wrap("**");
                }
                if (e.key === "i") {
                  e.preventDefault();
                  wrap("*");
                }
                if (e.key === "k") {
                  e.preventDefault();
                  wrap("[", "](https://)", "link");
                }
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
    </div>
  );
}

function Tool({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
        active
          ? "bg-lav-100 text-lav-700 dark:bg-night-600 dark:text-lav-100"
          : "text-lav-500 hover:bg-lav-100 hover:text-lav-700 dark:text-lav-300 dark:hover:bg-night-600"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-lav-200 dark:bg-night-border" />;
}

function ImagePopover({
  url,
  setUrl,
  onAdd,
  onUpload,
  onClose,
  busy,
  err,
}: {
  url: string;
  setUrl: (v: string) => void;
  onAdd: () => void;
  onUpload: () => void;
  onClose: () => void;
  busy: boolean;
  err: string;
}) {
  return (
    <div className="absolute bottom-full left-5 z-20 mb-2 w-[22rem] max-w-[calc(100%-2.5rem)] rounded-2xl border border-lav-200 bg-white p-4 shadow-glow dark:border-night-border dark:bg-night-700">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-lav-800 dark:text-lav-100">Insert an image</p>
        <button onClick={onClose} className="text-lav-400 hover:text-lav-600">
          <X size={16} />
        </button>
      </div>

      <label className="text-[11px] font-medium text-lav-500 dark:text-lav-300">
        Paste an image URL
      </label>
      <div className="mt-1 flex gap-2">
        <input
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder="https://…/photo.png"
          className="min-w-0 flex-1 rounded-xl border border-lav-200 bg-white px-3 py-2 text-sm outline-none focus:border-lav-400 dark:border-night-border dark:bg-night-800 dark:text-lav-100"
        />
        <button
          onClick={onAdd}
          disabled={!url.trim()}
          className="rounded-xl bg-lav-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <div className="my-3 flex items-center gap-2 text-[10px] text-lav-400">
        <span className="h-px flex-1 bg-lav-200 dark:bg-night-border" /> or{" "}
        <span className="h-px flex-1 bg-lav-200 dark:bg-night-border" />
      </div>

      <button
        onClick={onUpload}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-lav-200 bg-lav-50 py-2.5 text-xs font-semibold text-lav-700 transition hover:bg-lav-100 disabled:opacity-60 dark:border-night-border dark:bg-night-800 dark:text-lav-200"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {busy ? "Uploading to your Drive…" : "Upload to my Google Drive"}
      </button>

      {err && <p className="mt-2 text-[11px] text-rose-500">{err}</p>}

      <p className="mt-2 text-[10px] leading-relaxed text-lav-400">
        Uploads go to a “Murmur Uploads” folder in <strong>your</strong> Drive. To display in a
        browser the file is set to “anyone with the link” — unlisted, but reachable by anyone who
        has the URL. Use an image URL if you'd rather not do that.
      </p>
    </div>
  );
}
