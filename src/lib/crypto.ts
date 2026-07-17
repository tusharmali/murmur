/**
 * Client-side crypto. Everything here runs in the browser only.
 *
 * From (password, salt) we derive 512 bits with PBKDF2:
 *   - first 256 bits  -> AES-GCM key  (NEVER leaves the device)
 *   - second 256 bits -> hashed -> "verifier" (sent to master script for auth)
 *
 * The verifier reveals nothing about the AES key, so the master sheet can
 * authenticate a user without ever being able to decrypt their connection blob.
 */

const PBKDF2_ITERATIONS = 310000;
const enc = new TextEncoder();
const dec = new TextDecoder();

function buf2b64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function b642buf(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64);
  const buf = new ArrayBuffer(s.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

/** TextEncoder.encode over a guaranteed ArrayBuffer (BufferSource-compatible). */
function utf8(s: string): Uint8Array<ArrayBuffer> {
  const src = enc.encode(s);
  const buf = new ArrayBuffer(src.length);
  const out = new Uint8Array(buf);
  out.set(src);
  return out;
}

export function randomSaltB64(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return buf2b64(salt.buffer);
}

/** A random 256-bit key (base64) used to encrypt a shared channel's connection. */
export function randomKeyB64(): string {
  const k = crypto.getRandomValues(new Uint8Array(32));
  return buf2b64(k.buffer);
}

/**
 * Derive a per-channel token from the sheet's master TOKEN.
 *
 * Sharing must never hand out the master TOKEN — that would grant the invitee
 * every action on the owner's sheet (including reading unrelated channels).
 * Instead the owner shares HMAC-SHA256(channelId, TOKEN), which `user.gs`
 * accepts *only* for that one channel. Must byte-match Apps Script's
 * Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(id, TOKEN)).
 */
export async function channelTokenB64(masterToken: string, channelId: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8(masterToken),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, utf8(channelId));
  // web-safe base64, padding retained (matches base64EncodeWebSafe)
  return buf2b64(sig).replace(/\+/g, "-").replace(/\//g, "_");
}

/** Import a raw base64 key as an AES-GCM CryptoKey. */
export async function importAesKeyB64(b64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", b642buf(b64), { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

interface Derived {
  aesKey: CryptoKey;
  verifier: string;
}

export async function deriveFromPassword(password: string, saltB64: string): Promise<Derived> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    utf8(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: b642buf(saltB64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    512
  );
  const all = new Uint8Array(bits);
  const aesBytes = all.slice(0, 32);
  const verifierSeed = all.slice(32, 64);

  const aesKey = await crypto.subtle.importKey(
    "raw",
    aesBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  const verifierHash = await crypto.subtle.digest("SHA-256", verifierSeed);
  return { aesKey, verifier: buf2b64(verifierHash) };
}

export async function encryptJSON(obj: unknown, aesKey: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = utf8(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, data);
  return JSON.stringify({ iv: buf2b64(iv.buffer), ct: buf2b64(ct) });
}

export async function decryptJSON<T>(blob: string, aesKey: CryptoKey): Promise<T> {
  const { iv, ct } = JSON.parse(blob);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b642buf(iv) },
    aesKey,
    b642buf(ct)
  );
  return JSON.parse(dec.decode(pt)) as T;
}
