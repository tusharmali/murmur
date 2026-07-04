export type MessageType = "message" | "item";

export interface Message {
  id: string;
  channel: string;
  date: string; // YYYY-MM-DD (local)
  ts: number; // epoch ms
  type: MessageType;
  text: string;
  pinned: boolean;
  deleted?: boolean;
  editedTs?: number;
  tags?: string[];
  author?: string; // display name of who wrote it (matters for shared channels)
  authorEmail?: string;
}

export type ChannelKind = "personal" | "shared";

export interface Channel {
  id: string; // slug for personal, uuid for shared
  name: string;
  emoji?: string;
  kind: ChannelKind;
  // shared-only:
  ownerEmail?: string;
  isOwner?: boolean;
  members?: string[];
  conn?: ConnRef; // the OWNING sheet's connection (where this channel's data lives)
}

export interface ConnRef {
  scriptUrl: string;
  token: string;
}

export interface Connection extends ConnRef {
  displayName: string;
}

export interface Session {
  email: string;
  displayName: string;
  scriptUrl: string;
  token: string;
  verifier: string; // kept for authenticated master (channel) calls
}

/** channelId -> per-channel AES key (base64). Stored encrypted with the user's password key. */
export type Keyring = Record<string, string>;

export type SyncState = "idle" | "syncing" | "offline" | "error";

export interface QueueItem {
  key: string; // message id
  op: "upsert" | "delete";
  message?: Message;
  tries: number;
  ts: number;
}

export interface InitialSync {
  active: boolean;
  total: number;
  done: number;
  currentDate: string;
}
