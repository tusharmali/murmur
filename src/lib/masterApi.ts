/** Calls to the MASTER Apps Script (auth). */

import { post } from "./http";

const LS_KEY = "murmur::masterUrl";

export function getMasterUrl(): string {
  const env = process.env.NEXT_PUBLIC_MASTER_SCRIPT_URL;
  if (env) return env;
  if (typeof window !== "undefined") return localStorage.getItem(LS_KEY) || "";
  return "";
}

export function setMasterUrl(url: string) {
  if (typeof window !== "undefined") localStorage.setItem(LS_KEY, url.trim());
}

export async function masterPing(url: string) {
  return post(url, { action: "ping" });
}

export async function masterGetSalt(email: string) {
  return post(getMasterUrl(), { action: "getSalt", email });
}

export async function masterRegister(p: {
  email: string;
  salt: string;
  verifier: string;
  enc: string;
}) {
  return post(getMasterUrl(), { action: "register", ...p });
}

export async function masterLogin(email: string, verifier: string) {
  return post(getMasterUrl(), { action: "login", email, verifier });
}

export async function masterUpdateConnection(email: string, verifier: string, enc: string) {
  return post(getMasterUrl(), { action: "updateConnection", email, verifier, enc });
}

export async function masterSetKeyring(email: string, verifier: string, enc: string) {
  return post(getMasterUrl(), { action: "setKeyring", email, verifier, enc });
}

/* ---- shared channels ---- */

export async function masterShareChannel(p: {
  email: string;
  verifier: string;
  channelId: string;
  name: string;
  enc: string;
}) {
  return post(getMasterUrl(), { action: "shareChannel", ...p });
}

export async function masterJoinChannel(email: string, verifier: string, channelId: string) {
  return post(getMasterUrl(), { action: "joinChannel", email, verifier, channelId });
}

export async function masterListChannels(email: string, verifier: string) {
  return post(getMasterUrl(), { action: "listChannels", email, verifier });
}

export async function masterAddMember(
  email: string,
  verifier: string,
  channelId: string,
  member: string
) {
  return post(getMasterUrl(), { action: "addMember", email, verifier, channelId, member });
}

export async function masterRemoveMember(
  email: string,
  verifier: string,
  channelId: string,
  member: string
) {
  return post(getMasterUrl(), { action: "removeMember", email, verifier, channelId, member });
}

export async function masterUnshareChannel(email: string, verifier: string, channelId: string) {
  return post(getMasterUrl(), { action: "unshareChannel", email, verifier, channelId });
}
