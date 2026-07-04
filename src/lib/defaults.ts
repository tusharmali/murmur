import type { Channel } from "./types";

export const DEFAULT_CHANNELS: Channel[] = [
  { id: "general", name: "general", emoji: "💬", kind: "personal" },
  { id: "important", name: "important", emoji: "⭐", kind: "personal" },
  { id: "ideas", name: "ideas", emoji: "💡", kind: "personal" },
  { id: "links", name: "links", emoji: "🔗", kind: "personal" },
  { id: "todo", name: "todo", emoji: "✅", kind: "personal" },
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}
