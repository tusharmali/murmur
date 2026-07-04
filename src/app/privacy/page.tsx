import type { Metadata } from "next";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Murmur",
  description:
    "How Murmur handles your data: a zero-knowledge, local-first architecture where your notes live in a Google Sheet you own.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="Murmur is built so that your notes stay yours. This policy explains what data exists, where it lives, and why we can't read it."
      updated="July 4, 2026"
    >
      <p>
        Murmur is an open-source, local-first application for keeping personal messages and
        notes. It is designed around a simple principle: <strong>your content is encrypted on
        your device and stored in a Google Sheet you own</strong>. There is no central Murmur
        server that receives, stores, or can read your notes.
      </p>
      <p>
        Because Murmur can be self-hosted, the person or organization who deploys a given
        instance (the <strong>&ldquo;operator&rdquo;</strong>) is the data controller for that
        deployment. If you are using a hosted instance, the operator&rsquo;s contact details
        should be made available to you; for the official open-source project, questions can be
        raised via the{" "}
        <a href="https://github.com/tusharmali/murmur" target="_blank" rel="noopener noreferrer">
          GitHub repository
        </a>
        .
      </p>

      <h2 id="what-we-collect">1. What data exists, and where</h2>
      <p>Murmur stores data in three distinct locations, all under your control:</p>
      <ul>
        <li>
          <strong>Your device (browser storage).</strong> Your notes are cached as date-wise JSON
          in IndexedDB for instant, offline access. Your decrypted session (display name and the
          connection to your Sheet) is kept in <code>localStorage</code> so you stay signed in.
          Signing out clears it.
        </li>
        <li>
          <strong>The master sheet (authentication).</strong> To let you sign in across devices,
          the operator runs a &ldquo;master&rdquo; Google Sheet that stores, per account: your
          email address, a random salt, a password <em>verifier</em> (a hash that cannot decrypt
          anything), and an <strong>encrypted</strong> blob containing the connection to your
          private Sheet. It never receives your password or any readable note content.
        </li>
        <li>
          <strong>Your private Google Sheet (your content).</strong> The actual messages you
          write are stored in a Google Sheet that you create and own, inside your own Google
          account. Murmur communicates with it directly from your browser.
        </li>
      </ul>

      <h2 id="what-we-dont">2. What we do not do</h2>
      <ul>
        <li>We do not run analytics, advertising, or third-party trackers.</li>
        <li>We do not use cookies for tracking. Browser storage is used only to run the app.</li>
        <li>We do not sell, rent, or share your personal data. There is no data to sell.</li>
        <li>
          We do not have the ability to read your notes. Encryption keys are derived from your
          password and never leave your device.
        </li>
      </ul>

      <h2 id="encryption">3. Encryption</h2>
      <p>
        When you sign in, Murmur derives a 256-bit key from your password using PBKDF2 (SHA-256,
        310,000 iterations) and a per-account salt. That key is used with AES-GCM to encrypt the
        connection to your Sheet <strong>before</strong> it is ever transmitted or stored. A
        separate, independent segment of the derivation is hashed into a verifier used only to
        authenticate you. The verifier cannot be used to recover your key or decrypt your data.
      </p>

      <h2 id="google">4. Google as a sub-processor</h2>
      <p>
        Murmur relies on Google Apps Script and Google Sheets, which run under{" "}
        <strong>your own Google account</strong> (and, for authentication, the operator&rsquo;s).
        Your use of those services is subject to{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google&rsquo;s Privacy Policy
        </a>
        . We recommend keeping your private Sheet&rsquo;s Web App URL and secret token
        confidential, as together they grant access to that Sheet.
      </p>

      <h2 id="retention">5. Data retention &amp; deletion</h2>
      <p>You control retention directly:</p>
      <ul>
        <li>
          <strong>Local data:</strong> clear your browser storage for the site, or use
          &ldquo;Sign out&rdquo; to remove the active session.
        </li>
        <li>
          <strong>Your content:</strong> delete rows in, or delete entirely, your private Google
          Sheet.
        </li>
        <li>
          <strong>Authentication record:</strong> the master sheet holds only your email, salt,
          verifier, and ciphertext. Contact the operator to have your account row removed. Even
          before removal, it contains nothing readable.
        </li>
      </ul>

      <h2 id="shared">6. Shared channels</h2>
      <p>
        If you share a channel, its connection is stored encrypted with a per-channel key, and an
        access list of member email addresses is kept so the owner can manage membership. Anyone
        holding a channel&rsquo;s invite code can read and post to it; revoke access by
        &ldquo;stopping sharing&rdquo; and re-sharing to rotate the key. Email addresses in an
        access list are visible to that channel&rsquo;s members.
      </p>

      <h2 id="children">7. Children</h2>
      <p>
        Murmur is not directed to children under 13 (or the minimum age in your jurisdiction) and
        does not knowingly collect their data.
      </p>

      <h2 id="changes">8. Changes to this policy</h2>
      <p>
        We may update this policy as the software evolves. Material changes will be reflected by
        the &ldquo;Last updated&rdquo; date above and, where applicable, in the repository&rsquo;s
        release notes.
      </p>

      <h2 id="contact">9. Contact</h2>
      <p>
        For privacy questions about the open-source project, open a discussion or issue on{" "}
        <a href="https://github.com/tusharmali/murmur" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        . For a specific hosted deployment, contact its operator.
      </p>

      <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "#8a7fb0" }}>
        This document is provided as a template for operators of Murmur deployments and does not
        constitute legal advice. Operators should adapt it to their jurisdiction and add their own
        contact details.
      </p>
    </LegalShell>
  );
}
