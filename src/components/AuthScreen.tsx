"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { getMasterUrl, setMasterUrl, masterPing } from "@/lib/masterApi";
import { Lock, Sparkles, ShieldCheck, ChevronDown, Check, Loader2, ExternalLink } from "lucide-react";

// Baked-in at build time. When set, users never see the master-endpoint setup.
const ENV_LOCKED = Boolean(process.env.NEXT_PUBLIC_MASTER_SCRIPT_URL);

export default function AuthScreen() {
  const [masterUrl, setUrl] = useState("");
  const [masterReady, setMasterReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [masterErr, setMasterErr] = useState("");

  useEffect(() => {
    if (ENV_LOCKED) {
      setMasterReady(true);
      return;
    }
    const existing = getMasterUrl();
    if (existing) {
      setUrl(existing);
      setMasterReady(true);
    }
  }, []);

  async function saveMaster() {
    setChecking(true);
    setMasterErr("");
    try {
      const res = await masterPing(masterUrl.trim());
      if (!res?.ok) throw new Error("That URL did not respond like a Murmur master script.");
      setMasterUrl(masterUrl.trim());
      setMasterReady(true);
    } catch (e: any) {
      setMasterErr(e.message || "Could not reach that URL.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-lav-400 to-lav-600 text-white shadow-glow">
          <Sparkles size={22} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-lav-800 dark:text-lav-100">Murmur</h1>
      </div>

      {!masterReady ? (
        <MasterConfig
          value={masterUrl}
          onChange={setUrl}
          onSave={saveMaster}
          checking={checking}
          error={masterErr}
        />
      ) : (
        <AuthCard onReconfigure={ENV_LOCKED ? undefined : () => setMasterReady(false)} />
      )}

      <p className="mt-8 max-w-md text-center text-xs leading-relaxed text-lav-500">
        <ShieldCheck size={13} className="mr-1 inline" />
        Your notes live in your own Google Sheet. Your connection to it is encrypted in this
        browser with a key derived from your password — not even the master sheet can read it.
      </p>
    </div>
  );
}

function MasterConfig(props: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  checking: boolean;
  error: string;
}) {
  return (
    <div className="w-full max-w-md animate-fade-in rounded-3xl bg-white/80 p-7 shadow-soft ring-1 ring-lav-200/60 backdrop-blur dark:bg-night-800/80 dark:ring-night-border">
      <h2 className="text-lg font-semibold text-lav-800 dark:text-lav-100">Connect the master endpoint</h2>
      <p className="mt-1 text-sm text-lav-500">
        One-time setup for this deployment. Paste your <b>master</b> Apps Script Web App URL
        (the auth database).
      </p>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder="https://script.google.com/macros/s/…/exec"
        className="mt-4 w-full rounded-xl border border-lav-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-lav-400 focus:ring-2 focus:ring-lav-200 dark:border-night-border dark:bg-night-700 dark:text-lav-100 dark:placeholder:text-lav-400"
      />
      {props.error && <p className="mt-2 text-sm text-rose-500">{props.error}</p>}
      <button
        onClick={props.onSave}
        disabled={props.checking || !props.value.trim()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-lav-500 to-lav-600 py-2.5 font-medium text-white shadow-glow transition hover:brightness-105 disabled:opacity-50"
      >
        {props.checking ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
        Connect
      </button>
      <SetupGuide which="master" />
    </div>
  );
}

function AuthCard({ onReconfigure }: { onReconfigure?: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const login = useStore((s) => s.login);
  const register = useStore((s) => s.register);
  const authBusy = useStore((s) => s.authBusy);
  const authError = useStore((s) => s.authError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [scriptUrl, setScriptUrl] = useState("");
  const [token, setToken] = useState("");

  async function submit() {
    if (mode === "login") {
      await login(email, password);
    } else {
      await register({ email, password, displayName, scriptUrl, token });
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in rounded-3xl bg-white/80 p-7 shadow-soft ring-1 ring-lav-200/60 backdrop-blur dark:bg-night-800/80 dark:ring-night-border">
      <div className="mb-5 flex rounded-xl bg-lav-100 p-1 text-sm font-medium dark:bg-night-700">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-1.5 transition ${
              mode === m
                ? "bg-white text-lav-700 shadow-soft dark:bg-night-500 dark:text-lav-100"
                : "text-lav-500 dark:text-lav-400"
            }`}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
        <Field
          label="Password"
          value={password}
          onChange={setPassword}
          type="password"
          placeholder="••••••••"
        />

        {mode === "register" && (
          <>
            <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="Alex" />
            <div className="rounded-2xl bg-lav-50 p-3.5 ring-1 ring-lav-200/70 dark:bg-night-700/60 dark:ring-night-border">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-lav-700 dark:text-lav-200">
                <Lock size={12} /> Your private Google Sheet
              </p>
              <Field
                label="Private Apps Script URL"
                value={scriptUrl}
                onChange={setScriptUrl}
                placeholder="https://script.google.com/macros/s/…/exec"
                small
              />
              <div className="h-2.5" />
              <Field
                label="Secret token"
                value={token}
                onChange={setToken}
                placeholder="the TOKEN you set in your script"
                small
              />
              <SetupGuide which="user" />
            </div>
          </>
        )}
      </div>

      {authError && <p className="mt-3 text-sm text-rose-500">{authError}</p>}

      <button
        onClick={submit}
        disabled={authBusy}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-lav-500 to-lav-600 py-2.5 font-medium text-white shadow-glow transition hover:brightness-105 disabled:opacity-50"
      >
        {authBusy && <Loader2 className="animate-spin" size={18} />}
        {mode === "login" ? "Sign in" : "Create account & sync"}
      </button>

      {onReconfigure && (
        <button
          onClick={onReconfigure}
          className="mt-3 w-full text-center text-xs text-lav-400 hover:text-lav-600"
        >
          Change master endpoint
        </button>
      )}
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  small?: boolean;
}) {
  return (
    <label className="block">
      <span className={`mb-1 block font-medium text-lav-600 ${props.small ? "text-[11px]" : "text-xs"}`}>
        {props.label}
      </span>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className="w-full rounded-xl border border-lav-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-lav-400 focus:ring-2 focus:ring-lav-200 dark:border-night-border dark:bg-night-700 dark:text-lav-100 dark:placeholder:text-lav-400"
      />
    </label>
  );
}

const RAW_BASE = "https://raw.githubusercontent.com/tusharmali/murmur/main/apps-script";

function SetupGuide({ which }: { which: "master" | "user" }) {
  const [open, setOpen] = useState(false);
  const file = which === "master" ? "master.gs" : "user.gs";
  const rawUrl = `${RAW_BASE}/${file}`;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-medium text-lav-500 hover:text-lav-700"
      >
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
        How do I get this?
      </button>
      {open && (
        <div className="mt-2">
          <div className="mb-2 flex flex-wrap gap-2">
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-lav-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-lav-600"
            >
              <ExternalLink size={12} /> Open {file}
            </a>
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-lav-200 px-2.5 py-1.5 text-[11px] font-semibold text-lav-600 transition hover:bg-lav-50"
            >
              <ExternalLink size={12} /> New Google Sheet
            </a>
            <a
              href="/setup"
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border border-lav-200 px-2.5 py-1.5 text-[11px] font-semibold text-lav-600 transition hover:bg-lav-50"
            >
              Full guide
            </a>
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-[11px] leading-relaxed text-lav-500">
            <li>
              Click <b>New Google Sheet</b> above → <b>Extensions ▸ Apps Script</b>.
            </li>
            <li>
              Click <b>Open {file}</b>, select all (Ctrl+A) and copy. Paste it into Apps Script,
              replacing everything there.
            </li>
            {which === "user" && (
              <li>
                Replace <code>CHANGE_ME_to_a_long_random_secret</code> with a long random string —
                that&rsquo;s your <b>secret token</b>. Save (Ctrl+S).
              </li>
            )}
            <li>
              <b>Deploy ▸ New deployment ▸ Web app</b> — Execute as <b>Me</b>, access{" "}
              <b>Anyone</b>. Authorize when prompted.
            </li>
            <li>
              Copy the <b>Web app URL</b> and paste it above
              {which === "user" && <> (with the token you chose)</>}.
            </li>
          </ol>
          <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-[10px] leading-relaxed text-amber-700">
            <b>Updating later?</b> Use <b>Deploy ▸ Manage deployments ▸ ✏️ Edit ▸ Version: New
            version</b> — never &ldquo;New deployment&rdquo;, which creates a different URL and
            leaves your account on the old code.
          </p>
        </div>
      )}
    </div>
  );
}
