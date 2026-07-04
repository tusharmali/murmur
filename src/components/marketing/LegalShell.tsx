import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function LegalShell({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string;
  subtitle?: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      <header className="relative overflow-hidden px-5 pb-10 pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-lav-300/30 blur-3xl animate-float" />
          <div className="absolute right-0 top-16 h-64 w-64 rounded-full bg-pastel-pink/40 blur-3xl animate-float-slow" />
          <div className="absolute inset-0 dot-grid opacity-50" />
        </div>
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-lav-500 transition hover:text-lav-700"
          >
            <ArrowLeft size={15} /> Back to home
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-lav-900">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-lg text-lav-600">{subtitle}</p>}
          <p className="mt-4 text-sm text-lav-400">Last updated: {updated}</p>
        </div>
      </header>

      <main className="px-5 pb-24">
        <article className="legal mx-auto max-w-3xl">{children}</article>
      </main>

      <SiteFooter />
    </div>
  );
}
