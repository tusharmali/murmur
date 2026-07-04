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

export async function remoteDelete(c: Conn, id: string) {
  return post(c.scriptUrl, { action: "delete", token: c.token, id });
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
