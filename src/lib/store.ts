import { create } from "zustand";
import type {
  Channel,
  Connection,
  ConnRef,
  InitialSync,
  Keyring,
  Message,
  Session,
  SyncState,
} from "./types";
import * as db from "./db";
import {
  deriveFromPassword,
  encryptJSON,
  decryptJSON,
  randomSaltB64,
  randomKeyB64,
  importAesKeyB64,
} from "./crypto";
import {
  masterGetSalt,
  masterLogin,
  masterRegister,
  masterSetKeyring,
  masterShareChannel,
  masterJoinChannel,
  masterListChannels,
  masterAddMember,
  masterRemoveMember,
  masterUnshareChannel,
} from "./masterApi";
import {
  remoteDelete,
  remoteGetByDate,
  remoteGetByChannel,
  remoteGetDates,
  remoteUpsert,
  remoteGetSettings,
  remoteSetSettings,
  userPing,
} from "./userApi";
import { DEFAULT_CHANNELS, slugify } from "./defaults";
import { todayKey, coerceDateKey, isDateKey } from "./date";
import type { AppSettings } from "./types";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./settings";

const SESSION_KEY = "murmur::session";

type View = "channel" | "starred" | "search";

interface State {
  ready: boolean;
  session: Session | null;
  authError: string;
  authBusy: boolean;

  channels: Channel[];
  activeChannel: string;
  view: View;
  searchQuery: string;

  days: Record<string, Message[]>;

  sync: SyncState;
  pending: number;
  initialSync: InitialSync;
  channelSync: Record<string, boolean>; // channelId -> currently pull-syncing
  lastSynced: Record<string, number>; // channelId -> last successful pull (epoch ms)

  settings: AppSettings;
  initSettings: () => void;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;

  bootstrap: () => Promise<void>;
  register: (p: RegisterParams) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  setActiveChannel: (id: string) => void;
  setView: (v: View) => void;
  setSearch: (q: string) => void;
  addChannel: (name: string) => Promise<void>;
  syncChannel: (channelId: string) => Promise<void>;

  send: (text: string) => Promise<void>;
  edit: (m: Message, text: string) => Promise<void>;
  togglePin: (m: Message) => Promise<void>;
  remove: (m: Message) => Promise<void>;

  processQueue: () => Promise<void>;
  runInitialSync: () => Promise<void>;
  refreshSharedChannels: () => Promise<void>;
  exportAll: () => string;

  // shared channels / access
  shareChannel: (channelId: string) => Promise<string | null>;
  getInviteCode: (channelId: string) => string | null;
  joinChannel: (code: string) => Promise<boolean>;
  addMember: (channelId: string, member: string) => Promise<string>;
  removeMember: (channelId: string, member: string) => Promise<string>;
  unshareChannel: (channelId: string) => Promise<void>;
}

interface RegisterParams {
  email: string;
  password: string;
  displayName: string;
  scriptUrl: string;
  token: string;
}

/* ---- module-scoped (never persisted) ---- */
let currentAesKey: CryptoKey | null = null;
let keyring: Keyring = {};
let syncTimer: ReturnType<typeof setInterval> | null = null;

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
function saveSession(s: Session | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
}

export const useStore = create<State>((set, get) => ({
  ready: false,
  session: null,
  authError: "",
  authBusy: false,

  channels: DEFAULT_CHANNELS,
  activeChannel: "general",
  view: "channel",
  searchQuery: "",

  days: {},

  sync: "idle",
  pending: 0,
  initialSync: { active: false, total: 0, done: 0, currentDate: "" },
  channelSync: {},
  lastSynced: {},
  settings: DEFAULT_SETTINGS,

  initSettings: () => {
    set({ settings: loadSettings() });
  },

  setSetting: (key, value) => {
    const next = { ...get().settings, [key]: value };
    set({ settings: next });
    saveSettings(next);
    pushSettings(get); // debounced cross-device sync
  },

  bootstrap: async () => {
    get().initSettings();
    const session = loadSession();
    if (!session) {
      set({ ready: true });
      return;
    }
    await db.initDB(session.email);
    const channels = normalizeChannels((await db.getChannels()) || DEFAULT_CHANNELS);
    keyring = (await db.getMeta<Keyring>("keyring")) || {};
    const days = await healLocalDays(await db.getAllDays());
    set({ session, channels, days, ready: true, activeChannel: firstPersonal(channels) });
    get().processQueue();
    get().refreshSharedChannels();
    pullSettings(get);
    startSyncLoop(get);
  },

  register: async (p) => {
    set({ authBusy: true, authError: "" });
    try {
      const ping = await userPing(p.scriptUrl, p.token);
      if (!ping?.ok) throw new Error("Could not reach your private Apps Script (check URL + token).");

      const salt = randomSaltB64();
      const { aesKey, verifier } = await deriveFromPassword(p.password, salt);
      const conn: Connection = {
        scriptUrl: p.scriptUrl.trim(),
        token: p.token.trim(),
        displayName: p.displayName.trim(),
      };
      const enc = await encryptJSON(conn, aesKey);
      const res = await masterRegister({ email: p.email.trim(), salt, verifier, enc });
      if (!res?.ok) throw new Error(mapErr(res?.error));

      currentAesKey = aesKey;
      keyring = {};
      const session: Session = {
        email: p.email.trim(),
        displayName: conn.displayName || p.email.split("@")[0],
        scriptUrl: conn.scriptUrl,
        token: conn.token,
        verifier,
      };
      saveSession(session);
      await db.initDB(session.email);
      await db.putChannels(DEFAULT_CHANNELS);
      await db.putMeta("keyring", keyring);
      set({ session, channels: DEFAULT_CHANNELS, days: {}, authBusy: false, activeChannel: "general" });
      startSyncLoop(get);
      get().runInitialSync();
      return true;
    } catch (e: any) {
      set({ authBusy: false, authError: e.message || String(e) });
      return false;
    }
  },

  login: async (email, password) => {
    set({ authBusy: true, authError: "" });
    try {
      email = email.trim();
      const saltRes = await masterGetSalt(email);
      if (!saltRes?.ok) throw new Error("Invalid email or password.");
      const { aesKey, verifier } = await deriveFromPassword(password, saltRes.salt);
      const loginRes = await masterLogin(email, verifier);
      if (!loginRes?.ok) throw new Error("Invalid email or password.");
      const conn = await decryptJSON<Connection>(loginRes.enc, aesKey).catch(() => {
        throw new Error("Invalid email or password.");
      });

      currentAesKey = aesKey;
      const session: Session = {
        email,
        displayName: conn.displayName || email.split("@")[0],
        scriptUrl: conn.scriptUrl,
        token: conn.token,
        verifier,
      };
      saveSession(session);
      await db.initDB(email);

      // recover keyring (cross-device): prefer the encrypted one in master
      keyring = (await db.getMeta<Keyring>("keyring")) || {};
      if (loginRes.keyring) {
        try {
          const remoteRing = await decryptJSON<Keyring>(loginRes.keyring, aesKey);
          keyring = { ...keyring, ...remoteRing };
        } catch {
          /* ignore */
        }
      }
      await db.putMeta("keyring", keyring);

      const localChannels = normalizeChannels((await db.getChannels()) || DEFAULT_CHANNELS);
      const days = await db.getAllDays();
      const synced = await db.getMeta<boolean>("initialSyncDone");
      set({
        session,
        channels: localChannels,
        days,
        authBusy: false,
        activeChannel: firstPersonal(localChannels),
      });
      startSyncLoop(get);

      pullSettings(get); // cross-device appearance settings
      await loadSharedChannels(get, set); // dynamically load shared channels + members
      if (!synced) get().runInitialSync();
      else {
        get().processQueue();
        get().refreshSharedChannels();
      }
      return true;
    } catch (e: any) {
      set({ authBusy: false, authError: e.message || String(e) });
      return false;
    }
  },

  logout: () => {
    saveSession(null);
    currentAesKey = null;
    keyring = {};
    if (syncTimer) clearInterval(syncTimer);
    syncTimer = null;
    set({
      session: null,
      days: {},
      channels: DEFAULT_CHANNELS,
      activeChannel: "general",
      view: "channel",
      searchQuery: "",
      sync: "idle",
      pending: 0,
      initialSync: { active: false, total: 0, done: 0, currentDate: "" },
      channelSync: {},
      lastSynced: {},
    });
  },

  setActiveChannel: (id) => {
    set({ activeChannel: id, view: "channel" });
    get().syncChannel(id); // reload this channel's chats on open (targeted)
  },
  setView: (v) => set({ view: v }),
  setSearch: (q) => set({ searchQuery: q, view: q ? "search" : "channel" }),

  addChannel: async (name) => {
    const id = slugify(name);
    if (!id) return;
    const { channels } = get();
    if (channels.some((c) => c.id === id)) {
      set({ activeChannel: id, view: "channel" });
      return;
    }
    const next = [...channels, { id, name: id, emoji: "#", kind: "personal" as const }];
    await db.putChannels(next);
    set({ channels: next, activeChannel: id, view: "channel" });
  },

  send: async (text) => {
    text = text.trim();
    if (!text) return;
    const { activeChannel, session } = get();
    const date = todayKey();
    const m: Message = {
      id: crypto.randomUUID(),
      channel: activeChannel,
      date,
      ts: Date.now(),
      type: "message",
      text,
      pinned: false,
      author: session?.displayName,
      authorEmail: session?.email,
    };
    await db.upsertMessageLocal(m);
    set((s) => ({ days: { ...s.days, [date]: cloneDay(s.days, date, m) } }));
    await db.enqueue({ key: m.id, op: "upsert", message: m, tries: 0, ts: Date.now() });
    bumpPending(set);
    get().processQueue();
  },

  edit: async (m, text) => {
    text = text.trim();
    if (!text || text === m.text) return;
    const updated: Message = { ...m, text, editedTs: Date.now() };
    await db.upsertMessageLocal(updated);
    replaceInState(set, updated);
    await db.enqueue({ key: updated.id, op: "upsert", message: updated, tries: 0, ts: Date.now() });
    bumpPending(set);
    get().processQueue();
  },

  togglePin: async (m) => {
    const updated: Message = { ...m, pinned: !m.pinned };
    await db.upsertMessageLocal(updated);
    replaceInState(set, updated);
    await db.enqueue({ key: updated.id, op: "upsert", message: updated, tries: 0, ts: Date.now() });
    bumpPending(set);
    get().processQueue();
  },

  remove: async (m) => {
    await db.removeMessageLocal(m.id, m.date);
    set((s) => ({
      days: { ...s.days, [m.date]: (s.days[m.date] || []).filter((x) => x.id !== m.id) },
    }));
    await db.enqueue({ key: m.id, op: "delete", message: m, tries: 0, ts: Date.now() });
    bumpPending(set);
    get().processQueue();
  },

  /** Push pending writes, then pull ONLY this channel and reload its chats. */
  syncChannel: async (channelId) => {
    if (!channelId || get().channelSync[channelId]) return; // busy / invalid
    const conn = connForChannel(get, channelId);
    if (!conn) return;
    set((s) => ({ channelSync: { ...s.channelSync, [channelId]: true } }));
    try {
      await get().processQueue();
      // Don't overwrite local writes that haven't reached the sheet yet.
      const stillPending = (await db.getQueue()).some(
        (q) => (q.message?.channel || "") === channelId
      );
      if (!stillPending) {
        const res = await remoteGetByChannel(conn, channelId);
        if (res?.ok) {
          await replaceChannelMessages(set, channelId, res.messages || []);
          set((s) => ({ lastSynced: { ...s.lastSynced, [channelId]: Date.now() } }));
        }
      }
    } catch {
      set({ sync: "offline" });
    } finally {
      set((s) => ({ channelSync: { ...s.channelSync, [channelId]: false } }));
    }
  },

  processQueue: async () => {
    const { session } = get();
    if (!session) return;
    if (get().sync === "syncing") return;
    const items = await db.getQueue();
    if (items.length === 0) {
      set({ sync: "idle", pending: 0 });
      return;
    }
    set({ sync: "syncing", pending: items.length });
    for (const item of items) {
      const channelId = item.message?.channel || "";
      const conn = connForChannel(get, channelId);
      if (!conn) {
        await db.dequeue(item.key); // channel no longer accessible — drop
        continue;
      }
      try {
        if (item.op === "delete") await remoteDelete(conn, item.key);
        else if (item.message) await remoteUpsert(conn, item.message);
        await db.dequeue(item.key);
      } catch {
        set({ sync: "offline" });
        bumpPending(set);
        return;
      }
    }
    bumpPending(set);
    set({ sync: "idle" });
  },

  runInitialSync: async () => {
    const { session } = get();
    if (!session) return;
    const conn = { scriptUrl: session.scriptUrl, token: session.token };
    set({ initialSync: { active: true, total: 0, done: 0, currentDate: "" } });
    try {
      const datesRes = await remoteGetDates(conn);
      const dates = datesRes?.dates || [];
      set({ initialSync: { active: true, total: dates.length, done: 0, currentDate: "" } });
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        set((s) => ({ initialSync: { ...s.initialSync, currentDate: date, done: i } }));
        const res = await remoteGetByDate(conn, date);
        const msgs = sanitizeMessages(res?.messages).filter((m) => !m.deleted);
        msgs.sort((a, b) => a.ts - b.ts);
        // Bucket under the sanitized key (Sheets may hand back a mangled date).
        const key = coerceDateKey(date, msgs[0]?.ts) || date;
        await db.putDay(key, msgs);
        set((s) => ({ days: { ...s.days, [key]: msgs } }));
      }
      await db.putMeta("initialSyncDone", true);
      set((s) => ({ initialSync: { ...s.initialSync, active: false, done: dates.length } }));
      get().processQueue();
      get().refreshSharedChannels();
    } catch {
      await db.putMeta("initialSyncDone", true);
      set({ initialSync: { active: false, total: 0, done: 0, currentDate: "" }, sync: "offline" });
    }
  },

  refreshSharedChannels: async () => {
    const shared = get().channels.filter((c) => c.kind === "shared" && c.conn);
    for (const ch of shared) {
      try {
        const res = await remoteGetByChannel(ch.conn!, ch.id);
        if (res?.ok) await replaceChannelMessages(set, ch.id, res.messages || []);
      } catch {
        /* offline — keep local copy */
      }
    }
  },

  exportAll: () => JSON.stringify(get().days, null, 2),

  /* -------- shared channels -------- */

  shareChannel: async (channelId) => {
    const { session, channels } = get();
    if (!session) return null;
    let ch = channels.find((c) => c.id === channelId);
    if (!ch) return null;

    let targetId = channelId;
    // Personal -> shared requires a globally-unique id; migrate messages to a uuid.
    if (ch.kind === "personal") {
      targetId = crypto.randomUUID();
      await migrateChannelId(set, get, channelId, targetId, session);
      ch = { ...ch, id: targetId };
    }

    const key = keyring[targetId] || randomKeyB64();
    keyring[targetId] = key;
    const aesKey = await importAesKeyB64(key);
    const connBlob = {
      scriptUrl: session.scriptUrl,
      token: session.token,
      channelId: targetId,
      name: ch.name,
      ownerEmail: session.email,
    };
    const enc = await encryptJSON(connBlob, aesKey);
    const res = await masterShareChannel({
      email: session.email,
      verifier: session.verifier,
      channelId: targetId,
      name: ch.name,
      enc,
    });
    if (!res?.ok) throw new Error(res?.error || "Could not share channel.");

    const sharedCh: Channel = {
      ...ch,
      id: targetId,
      kind: "shared",
      isOwner: true,
      ownerEmail: session.email,
      members: [session.email],
      conn: { scriptUrl: session.scriptUrl, token: session.token },
      emoji: "🔗",
    };
    const nextChannels = upsertChannel(get().channels, sharedCh, channelId);
    set({ channels: nextChannels, activeChannel: targetId });
    await db.putChannels(nextChannels);
    await db.putMeta("keyring", keyring);
    await pushKeyring(session);
    return `${targetId}~${key}`;
  },

  getInviteCode: (channelId) => {
    const key = keyring[channelId];
    return key ? `${channelId}~${key}` : null;
  },

  joinChannel: async (code) => {
    const { session } = get();
    if (!session) return false;
    const sep = code.indexOf("~");
    if (sep === -1) throw new Error("That doesn't look like a valid invite code.");
    const channelId = code.slice(0, sep).trim();
    const key = code.slice(sep + 1).trim();
    if (!channelId || !key) throw new Error("That doesn't look like a valid invite code.");

    const res = await masterJoinChannel(session.email, session.verifier, channelId);
    if (!res?.ok) throw new Error(mapErr(res?.error));

    const aesKey = await importAesKeyB64(key);
    const conn = await decryptJSON<{
      scriptUrl: string;
      token: string;
      name: string;
      ownerEmail: string;
    }>(res.channel.enc, aesKey).catch(() => {
      throw new Error("Invite code key is wrong — could not unlock this channel.");
    });

    keyring[channelId] = key;
    await db.putMeta("keyring", keyring);
    await pushKeyring(session);

    const ch: Channel = {
      id: channelId,
      name: conn.name || res.channel.name || "shared",
      emoji: "🔗",
      kind: "shared",
      isOwner: res.channel.ownerEmail?.toLowerCase() === session.email.toLowerCase(),
      ownerEmail: res.channel.ownerEmail,
      members: res.channel.members || [],
      conn: { scriptUrl: conn.scriptUrl, token: conn.token },
    };
    const next = upsertChannel(get().channels, ch);
    set({ channels: next, activeChannel: channelId, view: "channel" });
    await db.putChannels(next);
    await get().refreshSharedChannels();
    return true;
  },

  addMember: async (channelId, member) => {
    const { session } = get();
    if (!session) return "";
    const res = await masterAddMember(session.email, session.verifier, channelId, member.trim());
    if (!res?.ok) return mapErr(res?.error);
    updateMembers(set, get, channelId, res.members);
    return "";
  },

  removeMember: async (channelId, member) => {
    const { session } = get();
    if (!session) return "";
    const res = await masterRemoveMember(session.email, session.verifier, channelId, member);
    if (!res?.ok) return mapErr(res?.error);
    updateMembers(set, get, channelId, res.members);
    return "";
  },

  unshareChannel: async (channelId) => {
    const { session } = get();
    if (!session) return;
    await masterUnshareChannel(session.email, session.verifier, channelId);
    const next = get().channels.filter((c) => c.id !== channelId);
    delete keyring[channelId];
    set({
      channels: next,
      activeChannel: firstPersonal(next),
    });
    await db.putChannels(next);
    await db.putMeta("keyring", keyring);
    await pushKeyring(session);
  },
}));

/* ---------- helpers ---------- */

function normalizeChannels(channels: Channel[]): Channel[] {
  return channels.map((c) => ({ ...c, kind: c.kind || "personal" }));
}

/**
 * Heal messages coming back from a Google Sheet: normalize the `date` field to a
 * clean YYYY-MM-DD key (Sheets can coerce it into a typed date on round-trip) so
 * day grouping never produces an "Invalid Date" bucket.
 */
/**
 * One-time (idempotent) local repair for data cached before the date fix:
 * re-buckets every stored message under a clean YYYY-MM-DD key, de-duplicates
 * by id (keeping the newest edit), and rewrites IndexedDB — removing any stale
 * "Invalid Date" buckets. Safe to run on every bootstrap; a no-op once healed.
 */
async function healLocalDays(
  raw: Record<string, Message[]>
): Promise<Record<string, Message[]>> {
  const oldKeys = Object.keys(raw);
  const byId = new Map<string, Message>();
  let changed = false;

  for (const key of oldKeys) {
    if (!isDateKey(key)) changed = true; // a mangled bucket key
    for (const m of raw[key]) {
      const date = coerceDateKey(m.date, m.ts);
      const fixed = date === m.date ? m : ((changed = true), { ...m, date });
      const prev = byId.get(fixed.id);
      if (prev) changed = true; // collapsing a duplicate id
      const rank = (x: Message) => x.editedTs || x.ts || 0;
      if (!prev || rank(fixed) >= rank(prev)) byId.set(fixed.id, fixed);
    }
  }

  const rebucketed: Record<string, Message[]> = {};
  for (const m of byId.values()) (rebucketed[m.date] ||= []).push(m);
  for (const d of Object.keys(rebucketed)) rebucketed[d].sort((a, b) => a.ts - b.ts);

  if (changed) {
    for (const k of oldKeys) if (!(k in rebucketed)) await db.deleteDay(k);
    for (const d of Object.keys(rebucketed)) await db.putDay(d, rebucketed[d]);
  }
  return rebucketed;
}

function sanitizeMessages(msgs: Message[] | undefined): Message[] {
  if (!msgs) return [];
  return msgs.map((m) => {
    const date = coerceDateKey(m.date, m.ts);
    return date === m.date ? m : { ...m, date };
  });
}

function firstPersonal(channels: Channel[]): string {
  const p = channels.find((c) => c.kind !== "shared");
  return p?.id || channels[0]?.id || "general";
}

function connForChannel(get: () => State, channelId: string): ConnRef | null {
  const ch = get().channels.find((c) => c.id === channelId);
  if (ch?.kind === "shared") return ch.conn || null;
  const s = get().session;
  return s ? { scriptUrl: s.scriptUrl, token: s.token } : null;
}

function cloneDay(days: Record<string, Message[]>, date: string, m: Message): Message[] {
  const arr = [...(days[date] || []), m];
  arr.sort((a, b) => a.ts - b.ts);
  return arr;
}

function replaceInState(set: SetFn, m: Message) {
  set((s) => ({
    days: { ...s.days, [m.date]: (s.days[m.date] || []).map((x) => (x.id === m.id ? m : x)) },
  }));
}

type SetFn = (fn: (s: State) => Partial<State>) => void;

async function bumpPending(set: (p: Partial<State>) => void) {
  const items = await db.getQueue();
  set({ pending: items.length });
}

function upsertChannel(channels: Channel[], ch: Channel, removeId?: string): Channel[] {
  let next = channels.filter((c) => c.id !== ch.id && (!removeId || c.id !== removeId));
  next = [...next, ch];
  return next;
}

function updateMembers(set: SetFn, get: () => State, channelId: string, members: string[]) {
  const next = get().channels.map((c) => (c.id === channelId ? { ...c, members } : c));
  set(() => ({ channels: next }));
  db.putChannels(next);
}

/** Replace ALL local messages for a channel with the freshly-pulled set (reconciles others' edits/deletes). */
async function replaceChannelMessages(set: SetFn, channelId: string, msgs: Message[]) {
  const byDate: Record<string, Message[]> = {};
  for (const m of sanitizeMessages(msgs).filter((x) => !x.deleted)) (byDate[m.date] ||= []).push(m);

  const current = await db.getAllDays();
  const dates = new Set([...Object.keys(current), ...Object.keys(byDate)]);
  const updates: Record<string, Message[]> = {};
  for (const date of dates) {
    const kept = (current[date] || []).filter((m) => m.channel !== channelId);
    const merged = [...kept, ...(byDate[date] || [])].sort((a, b) => a.ts - b.ts);
    if (merged.length || (current[date] && current[date].length)) {
      await db.putDay(date, merged);
      updates[date] = merged;
    }
  }
  set((s) => ({ days: { ...s.days, ...updates } }));
}

/** Retag every message in oldId -> newId (local + queue a remote upsert so the sheet matches). */
async function migrateChannelId(
  set: SetFn,
  get: () => State,
  oldId: string,
  newId: string,
  session: Session
) {
  const all = await db.getAllDays();
  const updates: Record<string, Message[]> = {};
  for (const date of Object.keys(all)) {
    let changed = false;
    const next = all[date].map((m) => {
      if (m.channel !== oldId) return m;
      changed = true;
      const nm: Message = { ...m, channel: newId };
      db.enqueue({ key: nm.id, op: "upsert", message: nm, tries: 0, ts: Date.now() });
      return nm;
    });
    if (changed) {
      await db.putDay(date, next);
      updates[date] = next;
    }
  }
  set((s) => ({ days: { ...s.days, ...updates } }));
  get().processQueue();
}

async function pushKeyring(session: Session) {
  if (!currentAesKey) return; // no password key in memory (post-reload) — will sync on next login
  try {
    const enc = await encryptJSON(keyring, currentAesKey);
    await masterSetKeyring(session.email, session.verifier, enc);
  } catch {
    /* best effort */
  }
}

async function loadSharedChannels(get: () => State, set: (p: Partial<State>) => void) {
  const session = get().session;
  if (!session) return;
  try {
    const res = await masterListChannels(session.email, session.verifier);
    if (!res?.ok) return;
    const shared: Channel[] = [];
    for (const rec of res.channels as any[]) {
      const key = keyring[rec.channelId];
      if (!key) continue; // no key for this channel on this device — skip
      try {
        const aesKey = await importAesKeyB64(key);
        const conn = await decryptJSON<{
          scriptUrl: string;
          token: string;
          name: string;
          ownerEmail: string;
        }>(rec.enc, aesKey);
        shared.push({
          id: rec.channelId,
          name: conn.name || rec.name || "shared",
          emoji: "🔗",
          kind: "shared",
          isOwner: rec.isOwner,
          ownerEmail: rec.ownerEmail,
          members: rec.members || [],
          conn: { scriptUrl: conn.scriptUrl, token: conn.token },
        });
      } catch {
        /* skip undecryptable */
      }
    }
    const personal = get().channels.filter((c) => c.kind !== "shared");
    const next = [...personal, ...shared];
    set({ channels: next });
    await db.putChannels(next);
    get().refreshSharedChannels();
  } catch {
    /* offline — keep locally cached channels */
  }
}

let settingsTimer: ReturnType<typeof setTimeout> | null = null;

/** Pull cross-device settings from the user's own sheet; remote wins. */
async function pullSettings(get: () => State) {
  const s = get().session;
  if (!s) return;
  try {
    const res = await remoteGetSettings({ scriptUrl: s.scriptUrl, token: s.token });
    if (res?.ok && res.settings) {
      const remote = JSON.parse(res.settings) as Partial<AppSettings>;
      const merged = { ...DEFAULT_SETTINGS, ...get().settings, ...remote };
      useStore.setState({ settings: merged });
      saveSettings(merged);
    }
  } catch {
    /* offline or user.gs not redeployed — keep local settings */
  }
}

/** Debounced push of settings to the user's own sheet. */
function pushSettings(get: () => State) {
  const s = get().session;
  if (!s) return;
  if (settingsTimer) clearTimeout(settingsTimer);
  settingsTimer = setTimeout(() => {
    remoteSetSettings(
      { scriptUrl: s.scriptUrl, token: s.token },
      JSON.stringify(get().settings)
    ).catch(() => {
      /* best effort */
    });
  }, 800);
}

function startSyncLoop(get: () => State) {
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = setInterval(() => {
    get().processQueue();
    // Targeted: only auto-pull the channel you're looking at, and only if it's
    // shared (others may be posting). Personal channels reload on open / on demand.
    const active = get().activeChannel;
    const ch = get().channels.find((c) => c.id === active);
    if (get().view === "channel" && ch?.kind === "shared") get().syncChannel(active);
  }, 15000);
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => get().processQueue());
  }
}

function mapErr(code?: string): string {
  switch (code) {
    case "email_exists":
      return "An account with that email already exists.";
    case "invalid_credentials":
      return "Authentication failed — please sign in again.";
    case "channel_not_found":
      return "That channel no longer exists.";
    case "not_owner":
      return "Only the channel owner can do that.";
    case "cannot_remove_owner":
      return "You can't remove the channel owner.";
    case "member_required":
      return "Enter an email address.";
    case "missing_fields":
      return "Something went wrong. Try again.";
    default:
      return code || "Something went wrong.";
  }
}
