# Security Policy

Murmur is an end-to-end-encrypted notes app: your notes live in **your own**
Google Sheet, and the connection to it is encrypted in your browser with a key
derived from your password. Because those are strong claims, we take reports
seriously and welcome scrutiny.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

- Preferred: use GitHub's **[Report a vulnerability](https://github.com/tusharmali/murmur/security/advisories/new)**
  (Security ▸ Advisories) for a private, coordinated disclosure.
- Or email **tusharmali197@gmail.com** with `Murmur security` in the subject.

Please include: what you found, how to reproduce it, the impact, and any
suggested fix. We'll acknowledge within a few days and keep you updated until
it's resolved. We're happy to credit you in the release notes.

## Scope

In scope:
- The crypto in `src/lib/crypto.ts` (PBKDF2 → AES-GCM, verifier derivation).
- The auth / access-control logic in `apps-script/master.gs`.
- Anything that could let the master sheet, its operator, or a network observer
  read a user's plaintext, sheet URL, or private token.

## Design notes (known, by-design trade-offs)

These are intentional properties, not bugs — but worth understanding:

- The **decrypted session** (sheet URL + token) is kept in `localStorage` on the
  user's own device for convenience. Signing out clears it. A compromised device
  or a malicious browser extension can read it — this is standard for client-side
  web apps.
- **Shared-channel invite codes** (`channelId~key`) grant read/write to that
  channel. Anyone who obtains a code holds the key; removing a member does not
  revoke a code they already have. Use **"Stop sharing" + re-share** to rotate.
- Forgetting your password means the encrypted connection blob **cannot** be
  recovered — re-link your sheet by re-registering. This is the cost of the master
  sheet never being able to read your data.
- `master.gs` is deployed with *Execute as: Me / Access: Anyone*. It only ever
  stores ciphertext and access lists, so a leaked master URL exposes no plaintext,
  but it is a public write endpoint — treat it accordingly.

## Supported versions

Murmur is distributed as source you self-host; security fixes land on `main`.
Pull the latest `main` and redeploy to stay current.
