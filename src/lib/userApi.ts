/** Calls to a USER's PRIVATE Apps Script (their data sheet). */

import { post } from "./http";
import type { Message } from "./types";

interface Conn {
  scriptUrl: string;
  token: string;
}

export async function userPing(scriptUrl: string, token: string) {
  return post(scriptUrl, { action: "ping", token });
}

export async function remoteUpsert(c: Conn, message: Message) {
  return post(c.scriptUrl, { action: "upsert", token: c.token, message });
}

/** Upload an image to the owner's Drive; returns a browser-renderable URL. */
export async function remoteUploadImage(
  c: Conn,
  p: { data: string; mimeType: string; name: string }
): Promise<{ ok: boolean; url?: string; error?: string }> {
  return post(c.scriptUrl, { action: "uploadImage", token: c.token, ...p });
}

/** `channel` is required for scoped (shared-channel) tokens to authorize the delete. */
export async function remoteDelete(c: Conn, id: string, channel?: string) {
  return post(c.scriptUrl, { action: "delete", token: c.token, id, channel });
}

export async function remoteGetDates(c: Conn): Promise<{ ok: boolean; dates: string[] }> {
  return post(c.scriptUrl, { action: "getDates", token: c.token });
}

export async function remoteGetByDate(
  c: Conn,
  date: string
): Promise<{ ok: boolean; messages: Message[] }> {
  return post(c.scriptUrl, { action: "getByDate", token: c.token, date });
}

export async function remoteGetByChannel(
  c: Conn,
  channel: string
): Promise<{ ok: boolean; messages: Message[] }> {
  return post(c.scriptUrl, { action: "getByChannel", token: c.token, channel });
}

/** Cross-device settings blob, stored in the user's own sheet (PropertiesService). */
export async function remoteGetSettings(
  c: Conn
): Promise<{ ok: boolean; settings?: string }> {
  return post(c.scriptUrl, { action: "getSettings", token: c.token });
}

export async function remoteSetSettings(c: Conn, settings: string) {
  return post(c.scriptUrl, { action: "setSettings", token: c.token, settings });
}
