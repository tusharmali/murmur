import Link from "next/link";
import { Sparkles, Github } from "lucide-react";

const GITHUB_URL = "https://github.com/tusharmali/murmur";

export default function SiteFooter() {
  return (
    <footer className="border-t border-lav-200/60 bg-white/50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lav-400 to-lav-600 text-white shadow-glow">
                <Sparkles size={18} />
              </span>
              <span className="text-lg font-semibold tracking-tight text-lav-800">Murmur</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-lav-500">
              A calm, private, local-first place for your messages and notes — end-to-end
              encrypted and stored in a Google Sheet you own.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol title="Product">
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/#how">How it works</FooterLink>
              <FooterLink href="/#privacy">Privacy model</FooterLink>
              <FooterLink href="/setup">Setup guide</FooterLink>
              <FooterLink href="/app">Open Murmur</FooterLink>
            </FooterCol>
            <FooterCol title="Legal">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/security">Security</FooterLink>
            </FooterCol>
            <FooterCol title="Open source">
              <FooterExtLink href={GITHUB_URL}>GitHub</FooterExtLink>
              <FooterExtLink href={`${GITHUB_URL}/blob/main/LICENSE`}>License</FooterExtLink>
              <FooterExtLink href={`${GITHUB_URL}/issues`}>Report an issue</FooterExtLink>
            </FooterCol>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-lav-200/60 pt-6 text-sm text-lav-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Murmur. Licensed under Apache 2.0.</p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition hover:text-lav-600"
          >
            <Github size={15} /> Built in the open
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-lav-400">{title}</h4>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-lav-600 transition hover:text-lav-800">
        {children}
      </Link>
    </li>
  );
}

function FooterExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-lav-600 transition hover:text-lav-800"
      >
        {children}
      </a>
    </li>
  );
}
