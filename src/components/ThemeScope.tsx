"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { resolveTheme, FONT_SCALE } from "@/lib/settings";

/**
 * Scopes appearance settings to the app subtree (not the whole <html>), so the
 * marketing pages are never affected. Tailwind's `dark:` variant matches on the
 * ancestor `[data-theme="dark"]` this element sets.
 */
export default function ThemeScope({ children }: { children: React.ReactNode }) {
  const settings = useStore((s) => s.settings);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const theme =
    settings.theme === "system" ? (systemDark ? "dark" : "light") : resolveTheme(settings.theme);

  return (
    <div
      data-theme={theme}
      data-density={settings.density}
      style={{ "--mur-font-scale": FONT_SCALE[settings.fontScale] } as React.CSSProperties}
      className="app-root min-h-screen"
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
