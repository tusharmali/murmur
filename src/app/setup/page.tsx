import type { Metadata } from "next";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Setup guide — Murmur",
  description:
    "Step-by-step: create your private Google Sheet, deploy the Murmur Apps Script, and connect your account. No coding required.",
  alternates: { canonical: "/setup" },
};

const RAW_USER = "https://raw.githubusercontent.com/tusharmali/murmur/main/apps-script/user.gs";
const RAW_MASTER = "https://raw.githubusercontent.com/tusharmali/murmur/main/apps-script/master.gs";

export default function SetupPage() {
  return (
    <LegalShell
      title="Setup guide"
      subtitle="Murmur stores your notes in a Google Sheet you own. That means a one-time setup — about 3 minutes, no coding needed. Follow along exactly."
      updated="July 5, 2026"
    >
      <h2 id="what">What you&rsquo;re about to do</h2>
      <p>
        You&rsquo;ll create a Google Sheet, paste in a small script that turns it into your private
        database, and publish it so only Murmur (with your secret token) can talk to it. Nothing is
        installed on your computer, and no one else — including us — can read it.
      </p>

      <h2 id="step1">Step 1 — Create your Sheet</h2>
      <ol>
        <li>
          Go to{" "}
          <a href="https://sheets.new" target="_blank" rel="noopener noreferrer">
            sheets.new
          </a>{" "}
          — a blank Google Sheet opens. Give it a name like &ldquo;Murmur Data&rdquo;.
        </li>
        <li>
          In the menu, click <strong>Extensions ▸ Apps Script</strong>. A new tab opens with a code
          editor containing <code>function myFunction() {"{}"}</code>.
        </li>
      </ol>

      <h2 id="step2">Step 2 — Paste the script</h2>
      <ol>
        <li>
          Open{" "}
          <a href={RAW_USER} target="_blank" rel="noopener noreferrer">
            <strong>user.gs</strong>
          </a>{" "}
          — it&rsquo;s plain text. Select all (<code>Ctrl+A</code> / <code>⌘A</code>) and copy (
          <code>Ctrl+C</code>).
        </li>
        <li>
          Back in the Apps Script tab, select everything in the editor and <strong>paste over
          it</strong>, so the script is the only thing there.
        </li>
        <li>
          Near the top you&rsquo;ll see:
          <br />
          <code>var TOKEN = &apos;CHANGE_ME_to_a_long_random_secret&apos;;</code>
          <br />
          Replace <code>CHANGE_ME_to_a_long_random_secret</code> with your own long random string
          (e.g. mash the keyboard — 30+ characters). <strong>This is your secret token — keep it
          safe, you&rsquo;ll paste it into Murmur in a minute.</strong>
        </li>
        <li>
          Save with <code>Ctrl+S</code> (or the 💾 icon).
        </li>
      </ol>

      <h2 id="step3">Step 3 — Publish it</h2>
      <ol>
        <li>
          Click <strong>Deploy ▸ New deployment</strong> (top right).
        </li>
        <li>
          Click the ⚙️ gear next to &ldquo;Select type&rdquo; and choose <strong>Web app</strong>.
        </li>
        <li>
          Set <strong>Execute as: Me</strong> and <strong>Who has access: Anyone</strong>.
          <br />
          <em>
            &ldquo;Anyone&rdquo; means anyone can reach the URL — but every request must carry your
            secret token, so without it they get rejected. This is required for your browser to
            talk to the sheet.
          </em>
        </li>
        <li>
          Click <strong>Deploy</strong>. Google will ask you to <strong>authorize</strong>. Choose
          your account → you may see &ldquo;Google hasn&rsquo;t verified this app&rdquo; → click{" "}
          <strong>Advanced ▸ Go to (your project)</strong> → <strong>Allow</strong>. (You&rsquo;re
          authorizing <em>your own</em> script to use <em>your own</em> sheet.)
        </li>
        <li>
          Copy the <strong>Web app URL</strong>. It ends in <code>/exec</code>.
        </li>
      </ol>

      <h2 id="step4">Step 4 — Connect Murmur</h2>
      <ol>
        <li>
          Open <a href="/app">Murmur</a> → <strong>Create account</strong>.
        </li>
        <li>
          Enter your email, a password, and your display name.
          <br />
          <strong>Your password never leaves your device</strong> — it derives the key that
          encrypts your sheet connection. If you lose it, it cannot be recovered.
        </li>
        <li>
          Paste the <strong>Web app URL</strong> and the <strong>secret token</strong> you chose in
          Step 2.
        </li>
        <li>
          Click <strong>Create account &amp; sync</strong>. Murmur pings your script first, so a
          wrong URL or token is caught immediately.
        </li>
      </ol>

      <h2 id="updating">Updating the script later ⚠️</h2>
      <p>
        This trips up almost everyone. When you paste in a newer version of the script, you must
        update your <em>existing</em> deployment — otherwise your old URL keeps running the old
        code:
      </p>
      <ul>
        <li>
          ✅ <strong>Deploy ▸ Manage deployments ▸ ✏️ Edit ▸ Version: New version ▸ Deploy</strong>{" "}
          — same URL, new code.
        </li>
        <li>
          ❌ <strong>Deploy ▸ New deployment</strong> — creates a <em>different</em> URL. Your
          account still points at the old one, so nothing appears to change.
        </li>
      </ul>
      <p>
        If Murmur says <em>&ldquo;Your Apps Script is out of date&rdquo;</em>, this is the fix.
      </p>

      <h2 id="images">Image uploads (optional)</h2>
      <p>
        The script can upload images to a &ldquo;Murmur Uploads&rdquo; folder in your Drive. Because
        it uses Drive, redeploying will ask you to authorize Drive access as well. To render in a
        browser, uploaded files are set to <strong>&ldquo;anyone with the link&rdquo;</strong> —
        unlisted, but reachable by anyone who has the URL. If you&rsquo;d rather not, just paste
        image URLs instead; both options are offered in the composer.
      </p>

      <h2 id="operator">For operators (hosting Murmur yourself)</h2>
      <p>
        If you&rsquo;re deploying Murmur for others, you also need the <strong>master</strong>{" "}
        script — the login directory. It stores only ciphertext, so it can&rsquo;t read anyone&rsquo;s
        notes.
      </p>
      <ol>
        <li>
          Create a second Sheet → Apps Script → paste{" "}
          <a href={RAW_MASTER} target="_blank" rel="noopener noreferrer">
            <strong>master.gs</strong>
          </a>{" "}
          → deploy as a Web app (Execute as Me, access Anyone).
        </li>
        <li>
          Set the URL as <code>NEXT_PUBLIC_MASTER_SCRIPT_URL</code> in your host&rsquo;s environment
          variables. The setup screen then disappears for your users.
        </li>
      </ol>

      <h2 id="trouble">Troubleshooting</h2>
      <ul>
        <li>
          <strong>&ldquo;Could not reach your private Apps Script&rdquo;</strong> — the URL must end
          in <code>/exec</code> (not <code>/dev</code>), and access must be <strong>Anyone</strong>.
        </li>
        <li>
          <strong>&ldquo;Your sheet rejected the request&rdquo;</strong> — the token in Murmur
          doesn&rsquo;t match <code>TOKEN</code> in your script.
        </li>
        <li>
          <strong>&ldquo;Your Apps Script is out of date&rdquo;</strong> — redeploy via{" "}
          <em>Manage deployments ▸ Edit ▸ New version</em> (see above).
        </li>
        <li>
          <strong>Still stuck?</strong>{" "}
          <a
            href="https://github.com/tusharmali/murmur/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open an issue on GitHub
          </a>{" "}
          — happy to help.
        </li>
      </ul>
    </LegalShell>
  );
}
