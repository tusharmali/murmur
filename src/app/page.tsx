import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Github,
  ShieldCheck,
  HardDriveDownload,
  Cloud,
  KeyRound,
  WifiOff,
  Users,
  Search,
  Star,
  FileJson,
  Lock,
  Hash,
  Check,
  Zap,
  Server,
} from "lucide-react";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import Reveal from "@/components/marketing/Reveal";

const GITHUB_URL = "https://github.com/tusharmali/murmur";

export const metadata: Metadata = {
  title: "Murmur — your private, local-first message vault",
  description:
    "A calm, Slack-like place for your messages and notes. Local-first, end-to-end encrypted, and autosaved to a Google Sheet you own. No servers, no tracking, open source.",
  openGraph: {
    title: "Murmur — your private, local-first message vault",
    description:
      "Local-first, end-to-end encrypted notes autosaved to your own Google Sheet. No servers. Open source.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <Hero />
      <TrustStrip />
      <Showcase />
      <Features />
      <HowItWorks />
      <PrivacyModel />
      <Faq />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}

/* ------------------------------- Hero ------------------------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-20 pt-36 sm:pt-40">
      {/* floating gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-lav-300/40 blur-3xl animate-float" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-pastel-pink/50 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pastel-blue/50 blur-3xl animate-float" />
        <div className="absolute inset-0 dot-grid opacity-60" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-lav-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-lav-600 shadow-soft backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-lav-400 animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lav-500" />
              </span>
              Open source · zero-knowledge · no servers
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-lav-900 sm:text-5xl lg:text-6xl">
              A calm, private home for{" "}
              <span className="text-gradient">everything you jot down.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-lav-600">
              Murmur is a Slack-like vault for your messages, ideas and important links —
              stored locally on your device and autosaved to a{" "}
              <strong className="font-semibold text-lav-800">Google Sheet you own</strong>. It's
              end-to-end encrypted, works offline, and runs on nobody's server but yours.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="group flex items-center gap-2 rounded-2xl bg-gradient-to-br from-lav-500 to-lav-600 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition hover:brightness-105"
              >
                Open Murmur
                <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl border border-lav-200 bg-white/70 px-6 py-3.5 text-base font-semibold text-lav-700 shadow-soft backdrop-blur transition hover:bg-white"
              >
                <Github size={18} /> View source
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-lav-500">
              {["No account tracking", "Free & self-hostable", "Your data, your Sheet"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check size={15} className="text-lav-500" /> {t}
                  </li>
                )
              )}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <AppPreview />
        </Reveal>
      </div>
    </section>
  );
}

/** A stylized, on-brand mock of the Murmur UI for the hero. */
function AppPreview() {
  return (
    <div className="relative mx-auto max-w-md animate-bob">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-lav-300/40 to-pastel-pink/40 blur-2xl" />
      <div className="overflow-hidden rounded-3xl border border-lav-200/70 bg-white/80 shadow-glow backdrop-blur">
        <div className="flex">
          {/* mini sidebar */}
          <div className="hidden w-32 shrink-0 flex-col gap-1 border-r border-lav-200/60 bg-lav-50/60 p-3 sm:flex">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-lav-400 to-lav-600 text-white">
                <Sparkles size={12} />
              </span>
              <span className="text-xs font-semibold text-lav-800">Murmur</span>
            </div>
            {[
              { e: "💬", n: "general", active: true },
              { e: "⭐", n: "important" },
              { e: "💡", n: "ideas" },
              { e: "🔗", n: "links" },
              { e: "✅", n: "todo" },
            ].map((c) => (
              <div
                key={c.n}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                  c.active ? "bg-white text-lav-700 shadow-soft" : "text-lav-500"
                }`}
              >
                <span>{c.e}</span> {c.n}
              </div>
            ))}
          </div>

          {/* messages */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-lav-200/60 px-4 py-3">
              <Hash size={14} className="text-lav-400" />
              <span className="text-sm font-semibold text-lav-800">general</span>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                <Check size={10} /> Saved
              </span>
            </div>
            <div className="space-y-3 p-4">
              <div className="mx-auto w-fit rounded-full bg-white px-2.5 py-0.5 text-[10px] font-medium text-lav-400 shadow-soft">
                Today
              </div>
              {[
                { t: "Ship the landing page 🪻", pin: true },
                { t: "Idea: weekly digest email" },
                { t: "github.com/tusharmali/murmur" },
              ].map((m, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-lav-400 to-lav-600 text-[11px] font-semibold text-white">
                    A
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-lav-800">Alex</span>
                      <span className="text-[10px] text-lav-400">6:0{i + 4} PM</span>
                      {m.pin && <Star size={10} className="text-amber-400" fill="currentColor" />}
                    </div>
                    <p className="truncate text-xs text-lav-600">{m.t}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto p-3">
              <div className="flex items-center gap-2 rounded-xl border border-lav-200 bg-white px-3 py-2">
                <span className="text-xs text-lav-400">Message #general…</span>
                <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-lav-500 to-lav-600 text-white">
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating "encrypted" chip */}
      <div className="absolute -bottom-4 -left-4 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-medium text-lav-700 shadow-glow ring-1 ring-lav-200/70">
        <Lock size={13} className="text-lav-500" /> Encrypted on your device
      </div>
    </div>
  );
}

/* --------------------------- Trust strip --------------------------- */

function TrustStrip() {
  const items = [
    { icon: <HardDriveDownload size={18} />, label: "Local-first" },
    { icon: <KeyRound size={18} />, label: "AES-GCM encrypted" },
    { icon: <Cloud size={18} />, label: "Your Google Sheet" },
    { icon: <WifiOff size={18} />, label: "Works offline" },
    { icon: <Server size={18} />, label: "No servers" },
  ];
  return (
    <section className="border-y border-lav-200/50 bg-white/40 py-6">
      <Reveal className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-sm font-medium text-lav-600">
            <span className="text-lav-500">{it.icon}</span>
            {it.label}
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ----------------------------- Showcase ---------------------------- */

function Showcase() {
  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <SectionKicker icon={<Sparkles size={13} />}>See it in action</SectionKicker>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-lav-900 sm:text-4xl">
            Familiar as chat. Private as a diary.
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="relative rounded-2xl border border-lav-200/70 bg-white/70 p-2 shadow-glow backdrop-blur">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-lav-300/40 to-pastel-pink/40 blur-2xl" />
            {/* browser chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-rose-300" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-300" />
              <span className="ml-3 truncate rounded-md bg-lav-50 px-3 py-1 text-xs text-lav-400">
                murmur-chat.vercel.app/app
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/screenshots/app.png"
              alt="The Murmur interface — channels, messages grouped by date, pin and search"
              className="w-full rounded-xl"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- Features ---------------------------- */

const FEATURES = [
  {
    icon: <HardDriveDownload size={22} />,
    title: "Local-first",
    body: "Every message saves to your browser instantly as date-wise JSON in IndexedDB — one blob per day. It's fast, and it's yours even offline.",
  },
  {
    icon: <KeyRound size={22} />,
    title: "End-to-end encrypted",
    body: "A key derived from your password (PBKDF2 → AES-GCM) never leaves your device. Your sheet connection is encrypted in the browser before it's ever stored.",
  },
  {
    icon: <Cloud size={22} />,
    title: "Autosaved to your Sheet",
    body: "Your notes live in a Google Sheet you own, via a tiny Apps Script you deploy. Your data never touches a server we run — because there isn't one.",
  },
  {
    icon: <WifiOff size={22} />,
    title: "Offline-first sync",
    body: "Write anytime. Changes queue locally and sync to your Sheet when you're back online, with a clear status badge so you always know where things stand.",
  },
  {
    icon: <Users size={22} />,
    title: "Shared channels",
    body: "Share a channel with a single invite code. Members read and post against the owner's Sheet — with per-channel keys the master sheet can't read.",
  },
  {
    icon: <Search size={22} />,
    title: "Search, pin & export",
    body: "Full-text search across every day, a Pinned view for what matters, auto-linkified URLs, and one-click export of all your JSON. No lock-in.",
  },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionKicker icon={<Zap size={13} />}>Why Murmur</SectionKicker>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-lav-900 sm:text-4xl">
            The privacy of a paper notebook, the convenience of the cloud.
          </h2>
          <p className="mt-4 text-lav-600">
            Most note apps ask you to trust their servers. Murmur asks you to trust math and
            your own Google account — nothing else.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <article className="group h-full rounded-3xl card-glass p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lav-400 to-lav-600 text-white shadow-glow transition group-hover:scale-105">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-lav-800">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-lav-600">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- How it works -------------------------- */

const STEPS = [
  {
    n: "01",
    title: "Deploy your Sheet",
    body: "Create a Google Sheet, paste in Murmur's Apps Script, and deploy it as a Web App. It becomes your private database — you set a secret token only you hold.",
  },
  {
    n: "02",
    title: "Create your account",
    body: "Pick an email and password. Murmur derives your encryption key locally and stores your Sheet's connection as ciphertext. Your password never leaves the device.",
  },
  {
    n: "03",
    title: "Write from anywhere",
    body: "Jot messages, ideas and links across channels. Everything saves instantly on-device and syncs to your Sheet — on every browser you sign in from.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 bg-white/40 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionKicker icon={<ArrowRight size={13} />}>How it works</SectionKicker>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-lav-900 sm:text-4xl">
            Yours in three steps.
          </h2>
          <p className="mt-4 text-lav-600">
            A one-time setup, then it fades into the background. Full instructions ship in the
            repo's README.
          </p>
        </Reveal>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-lav-300 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="relative h-full rounded-3xl card-glass p-7 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-gradient shadow-soft ring-1 ring-lav-200">
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-lav-800">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-lav-600">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Privacy model ------------------------- */

function PrivacyModel() {
  const points = [
    "Your password derives a 256-bit AES-GCM key that never leaves your browser.",
    "The connection to your private Sheet is encrypted before it's stored anywhere.",
    "The master sheet that handles login only ever sees ciphertext — even its operator can't read your data or find your Sheet.",
    "Shared-channel keys travel in an encrypted keyring, so the directory can't unlock them either.",
  ];
  return (
    <section id="privacy" className="scroll-mt-24 px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <SectionKicker icon={<ShieldCheck size={13} />}>Zero-knowledge by design</SectionKicker>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-lav-900 sm:text-4xl">
            We literally can't read your notes.
          </h2>
          <p className="mt-4 text-lav-600">
            Murmur is built so that trust isn't required. Encryption happens on your device, and
            the only place your plaintext exists is your own screen and your own Google Sheet.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-relaxed text-lav-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lav-100 text-lav-600">
                  <Check size={12} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <Link
            href="/security"
            className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-lav-700 transition hover:text-lav-900"
          >
            Read the security overview <ArrowRight size={15} />
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <FlowDiagram />
        </Reveal>
      </div>
    </section>
  );
}

function FlowDiagram() {
  const rows = [
    { icon: <Lock size={16} />, label: "Your browser", sub: "PBKDF2 → AES-GCM · key stays here", tone: "from-lav-400 to-lav-600" },
    { icon: <Server size={16} />, label: "Master script", sub: "auth only · stores ciphertext", tone: "from-lav-300 to-lav-500" },
    { icon: <Cloud size={16} />, label: "Your Google Sheet", sub: "your messages · owned by you", tone: "from-lav-400 to-lav-600" },
  ];
  return (
    <div className="relative rounded-3xl card-glass p-6 shadow-glow sm:p-8">
      <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-lav-200/50 to-pastel-blue/40 blur-2xl" />
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={r.label}>
            <div className="flex items-center gap-3 rounded-2xl border border-lav-200/70 bg-white/80 p-4">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${r.tone} text-white shadow-soft`}
              >
                {r.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-lav-800">{r.label}</p>
                <p className="text-xs text-lav-500">{r.sub}</p>
              </div>
            </div>
            {i < rows.length - 1 && (
              <div className="flex justify-center py-1 text-lav-300">
                <div className="h-5 w-px bg-lav-300" />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-5 flex items-center gap-2 rounded-xl bg-lav-50 px-3 py-2 text-xs text-lav-500">
        <FileJson size={14} /> Local copy: date-wise JSON in IndexedDB + an offline sync queue.
      </p>
    </div>
  );
}

/* ------------------------------- FAQ ------------------------------- */

const FAQS = [
  {
    q: "Is Murmur really free?",
    a: "Yes. Murmur is open source under the Apache 2.0 license. You can use the hosted build, or clone the repo and run it yourself. There's no paid tier and no account upsell.",
  },
  {
    q: "Where is my data actually stored?",
    a: "Two places you control: locally in your browser (IndexedDB) for instant, offline access, and in a Google Sheet you deploy and own. Nobody else runs a server that holds your notes.",
  },
  {
    q: "What happens if I forget my password?",
    a: "Your encryption key is derived from your password and never stored, so a forgotten password can't be recovered — by design. You simply re-register and re-link your Sheet; your data in the Sheet is untouched.",
  },
  {
    q: "Do I need to be technical to use it?",
    a: "The one-time setup involves pasting a script into Google Apps Script and deploying it — the README walks through every click. After that, it's just a chat box.",
  },
  {
    q: "Can I share notes with other people?",
    a: "Yes. Any channel can be shared with an invite code. Members read and write against the owner's Sheet, and each shared channel has its own key that the login directory can't read.",
  },
  {
    q: "Is it audited?",
    a: "Murmur is young and community-driven — the crypto and auth code is small, open, and documented so anyone can review it. Security reports are welcome via GitHub's private advisories.",
  },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-white/40 px-5 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <SectionKicker icon={<Sparkles size={13} />}>Questions</SectionKicker>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-lav-900 sm:text-4xl">
            Good things to know.
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 50}>
              <details className="group rounded-2xl card-glass px-5 py-4 shadow-soft transition open:shadow-glow">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-lav-800">
                  {f.q}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lav-100 text-lav-600 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-lav-600">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Final CTA --------------------------- */

function FinalCta() {
  return (
    <section className="px-5 py-24">
      <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-lav-500 to-lav-700 px-8 py-16 text-center shadow-glow">
        <div className="pointer-events-none absolute inset-0 -z-0 opacity-30">
          <div className="absolute -left-10 -top-10 h-52 w-52 rounded-full bg-white/30 blur-3xl animate-float" />
          <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-pastel-pink/40 blur-3xl animate-float-slow" />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your notes deserve a quiet, private room.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lav-100">
            Set it up once, then just write. Murmur stays out of your way — and off everyone
            else's servers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-semibold text-lav-700 shadow-glow transition hover:brightness-105"
            >
              Open Murmur
              <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              <Github size={18} /> Star on GitHub
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ----------------------------- shared bits ------------------------- */

function SectionKicker({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-lav-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lav-600 shadow-soft">
      <span className="text-lav-500">{icon}</span>
      {children}
    </span>
  );
}
