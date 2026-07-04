import type { Metadata } from "next";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Security — Murmur",
  description:
    "Murmur's security model: client-side PBKDF2 + AES-GCM encryption, a zero-knowledge master directory, and responsible disclosure.",
};

export default function SecurityPage() {
  return (
    <LegalShell
      title="Security"
      subtitle="How Murmur protects your data, what it deliberately does not protect against, and how to report a vulnerability."
      updated="July 4, 2026"
    >
      <h2 id="model">1. The model in one paragraph</h2>
      <p>
        Murmur is <strong>zero-knowledge by design</strong>. Your password is turned into an
        encryption key inside your browser, and that key never leaves your device. The connection
        to your private Google Sheet is encrypted with it before being stored, so the login
        directory that authenticates you only ever holds ciphertext. Your notes themselves live in
        a Google Sheet you own.
      </p>

      <h2 id="crypto">2. Cryptography</h2>
      <ul>
        <li>
          <strong>Key derivation:</strong> PBKDF2 with SHA-256 and 310,000 iterations over your
          password and a random 16-byte per-account salt, producing 512 bits.
        </li>
        <li>
          <strong>Encryption key:</strong> the first 256 bits become an AES-GCM key used to
          encrypt your Sheet connection and your keyring. It is non-extractable and never
          transmitted.
        </li>
        <li>
          <strong>Verifier:</strong> the second 256 bits are hashed with SHA-256 into a verifier
          used solely for authentication. It reveals nothing about the encryption key.
        </li>
        <li>
          <strong>Per-channel keys:</strong> shared channels use independent random 256-bit keys,
          carried between your devices in an encrypted keyring.
        </li>
      </ul>

      <h2 id="protects">3. What this protects against</h2>
      <ul>
        <li>
          The operator of the master (login) sheet cannot read your notes, your Sheet&rsquo;s
          location, or your password.
        </li>
        <li>
          A leak of the master sheet exposes only ciphertext, salts, verifiers, and access lists —
          no plaintext content.
        </li>
        <li>
          A network observer cannot read your content, which is encrypted before transmission
          where the connection blob is concerned and otherwise sent directly to your own Sheet
          over HTTPS.
        </li>
      </ul>

      <h2 id="tradeoffs">4. Known trade-offs (by design)</h2>
      <ul>
        <li>
          <strong>Device trust.</strong> Your decrypted session lives in <code>localStorage</code>{" "}
          on your own device. A compromised device or malicious browser extension can read it.
          Sign out to clear it.
        </li>
        <li>
          <strong>Password recovery is impossible.</strong> Because the key is derived from your
          password and never stored, a forgotten password cannot be recovered; you re-register and
          re-link your Sheet.
        </li>
        <li>
          <strong>Invite codes are bearer tokens.</strong> Anyone holding a shared channel&rsquo;s
          code has its key. Removing a member does not revoke a code they already hold — stop
          sharing and re-share to rotate the key.
        </li>
        <li>
          <strong>Your Sheet&rsquo;s token is a secret.</strong> The Web App URL plus token grant
          access to your data; keep them confidential.
        </li>
      </ul>

      <h2 id="disclosure">5. Reporting a vulnerability</h2>
      <p>
        Please report security issues privately, not as public issues. Use GitHub&rsquo;s{" "}
        <a
          href="https://github.com/tusharmali/murmur/security/advisories/new"
          target="_blank"
          rel="noopener noreferrer"
        >
          private vulnerability reporting
        </a>{" "}
        for the repository. Include what you found, how to reproduce it, and the impact. We aim to
        acknowledge reports promptly and are glad to credit reporters in release notes. See the
        repository&rsquo;s{" "}
        <a
          href="https://github.com/tusharmali/murmur/blob/main/SECURITY.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          SECURITY.md
        </a>{" "}
        for full details.
      </p>

      <h2 id="review">6. Review it yourself</h2>
      <p>
        The security-relevant code is deliberately small and readable. The client crypto lives in{" "}
        <code>src/lib/crypto.ts</code> and the authentication and access-control logic in{" "}
        <code>apps-script/master.gs</code>. We encourage independent review — that&rsquo;s the
        point of being open source.
      </p>
    </LegalShell>
  );
}
