/**
 * User appearance & behavior settings.
 *
 * Persistence is layered:
 *   1. localStorage — instant, per-device, always the source of truth locally.
 *   2. The user's own Google Sheet (via user.gs PropertiesService) — optional
 *      cross-device sync, handled in the store. Degrades gracefully if the
 *      user hasn't redeployed user.gs.
 */

import type { AppSettings } from "./types";

const LS_KEY = "murmur::settings";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  density: "comfortable",
  fontScale: "md",
  showAvatars: true,
  showSenderNames: true,
  showDateDividers: true,
  messageSeparators: false,
  timeFormat: "12h",
  enterToSend: true,
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {
    /* storage full / disabled — ignore */
  }
}

export const FONT_SCALE: Record<AppSettings["fontScale"], string> = {
  sm: "0.92",
  md: "1",
  lg: "1.12",
};

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches === true
  );
}

export function resolveTheme(mode: AppSettings["theme"]): "light" | "dark" {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}
