import Link from "next/link";
import { CloudOff, ArrowRight } from "lucide-react";

export const metadata = { title: "Offline — Murmur" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-lav-100 text-lav-500">
        <CloudOff size={30} />
      </div>
      <h1 className="text-2xl font-semibold text-lav-800">You&rsquo;re offline</h1>
      <p className="mt-2 max-w-sm text-lav-500">
        Murmur is local-first, so your notes are still safe on this device. Reconnect to sync with
        your Google Sheet.
      </p>
      <Link
        href="/app"
        className="mt-6 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-lav-500 to-lav-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-105"
      >
        Open your vault <ArrowRight size={16} />
      </Link>
    </div>
  );
}
