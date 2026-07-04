"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import AuthScreen from "@/components/AuthScreen";
import AppShell from "@/components/AppShell";
import SyncOverlay from "@/components/SyncOverlay";
import ThemeScope from "@/components/ThemeScope";

export default function AppPage() {
  const ready = useStore((s) => s.ready);
  const session = useStore((s) => s.session);
  const bootstrap = useStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <ThemeScope>
      {!ready ? (
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-lav-500 dark:text-lav-300">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-lav-300 border-t-lav-600" />
            <p className="text-sm">Opening your vault…</p>
          </div>
        </div>
      ) : !session ? (
        <AuthScreen />
      ) : (
        <>
          <AppShell />
          <SyncOverlay />
        </>
      )}
    </ThemeScope>
  );
}
