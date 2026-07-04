"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Github, ArrowRight, Menu, X } from "lucide-react";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#privacy", label: "Privacy" },
  { href: "/#faq", label: "FAQ" },
];

const GITHUB_URL = "https://github.com/tusharmali/murmur";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-lav-200/60 shadow-soft" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lav-400 to-lav-600 text-white shadow-glow">
            <Sparkles size={18} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-lav-800">Murmur</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-lav-600 transition hover:bg-lav-100/70 hover:text-lav-800"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-lav-600 transition hover:bg-lav-100/70 hover:text-lav-800"
          >
            <Github size={16} /> Star on GitHub
          </a>
          <Link
            href="/app"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-lav-500 to-lav-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-105"
          >
            Open Murmur <ArrowRight size={15} />
          </Link>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-lav-700 transition hover:bg-lav-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="glass border-t border-lav-200/60 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-lav-700 hover:bg-lav-100"
              >
                {n.label}
              </a>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-lav-700 hover:bg-lav-100"
            >
              <Github size={16} /> Star on GitHub
            </a>
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-lav-500 to-lav-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow"
            >
              Open Murmur <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
