/**
 * Local database — IndexedDB, scoped per signed-in user.
 *
 * Data is stored DATE-WISE: the `days` store maps a date key (YYYY-MM-DD) to
 * the JSON array of that day's messages — exactly the "date-wise JSON in local"
 * model. A separate `queue` store holds pending sync operations (offline-first),
 * and `meta` holds channels + sync bookkeeping.
 */

import { openDB, type IDBPDatabase } from "idb";
import type { Channel, Message, QueueItem } from "./types";

const VERSION = 1;
let dbPromise: Promise<IDBPDatabase> | null = null;
let currentScope = "";

function dbName(scope: string) {
  return `murmur::${scope}`;
}

export function initDB(scope: string) {
  if (dbPromise && currentScope === scope) return dbPromise;
  currentScope = scope;
  dbPromise = openDB(dbName(scope), VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("days")) db.createObjectStore("days");
      if (!db.objectStoreNames.contains("queue")) db.createObjectStore("queue", { keyPath: "key" });
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
    },
  });
  return dbPromise;
}

function db() {
  if (!dbPromise) throw new Error("DB not initialised — call initDB(scope) first.");
  return dbPromise;
}

/* ---- days (date-wise JSON) ---- */

export async function getDay(date: string): Promise<Message[]> {
  return (await (await db()).get("days", date)) || [];
}

export async function putDay(date: string, messages: Message[]) {
  await (await db()).put("days", messages, date);
}

export async function deleteDay(date: string) {
  await (await db()).delete("days", date);
}

export async function getAllDays(): Promise<Record<string, Message[]>> {
  const d = await db();
  const keys = (await d.getAllKeys("days")) as string[];
  const vals = (await d.getAll("days")) as Message[][];
  const out: Record<string, Message[]> = {};
  keys.forEach((k, i) => (out[k] = vals[i]));
  return out;
}

export async function upsertMessageLocal(m: Message) {
  const day = await getDay(m.date);
  const idx = day.findIndex((x) => x.id === m.id);
  if (idx === -1) day.push(m);
  else day[idx] = m;
  day.sort((a, b) => a.ts - b.ts);
  await putDay(m.date, day);
}

export async function removeMessageLocal(id: string, date: string) {
  const day = await getDay(date);
  await putDay(date, day.filter((x) => x.id !== id));
}

/* ---- queue ---- */

export async function enqueue(item: QueueItem) {
  await (await db()).put("queue", item);
}

export async function dequeue(key: string) {
  await (await db()).delete("queue", key);
}

export async function getQueue(): Promise<QueueItem[]> {
  return (await (await db()).getAll("queue")) as QueueItem[];
}

/* ---- meta ---- */

export async function getChannels(): Promise<Channel[] | undefined> {
  return (await db()).get("meta", "channels");
}

export async function putChannels(channels: Channel[]) {
  await (await db()).put("meta", channels, "channels");
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await db()).get("meta", key);
}

export async function putMeta(key: string, value: unknown) {
  await (await db()).put("meta", value, key);
}
