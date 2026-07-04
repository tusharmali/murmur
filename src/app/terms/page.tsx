import type { Metadata } from "next";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — Murmur",
  description:
    "The terms under which Murmur, an open-source, self-hostable notes application, is provided.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      subtitle="Plain terms for a free, open-source app. Please read them before using Murmur."
      updated="July 4, 2026"
    >
      <h2 id="acceptance">1. Acceptance</h2>
      <p>
        By accessing or using Murmur (the &ldquo;Service&rdquo;), you agree to these Terms of
        Service. If you do not agree, please do not use the Service. If you use a hosted instance,
        that instance&rsquo;s operator may supply additional terms.
      </p>

      <h2 id="service">2. The Service</h2>
      <p>
        Murmur is free, open-source software that lets you store personal messages and notes
        locally in your browser and in a Google Sheet you own. The source code is available on{" "}
        <a href="https://github.com/tusharmali/murmur" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{" "}
        under the Apache License 2.0. You may self-host it, modify it, and redistribute it under
        the terms of that license.
      </p>

      <h2 id="accounts">3. Your account &amp; responsibilities</h2>
      <p>You are responsible for:</p>
      <ul>
        <li>
          <strong>Your password.</strong> It is used to derive your encryption key and is never
          transmitted or stored. If you lose it, your encrypted connection cannot be recovered and
          you will need to re-register and re-link your Sheet. Your existing content in the Sheet
          is not affected.
        </li>
        <li>
          <strong>Your Google Sheet and secret token.</strong> Keep the Web App URL and token
          confidential; together they grant access to your data. You are responsible for deploying
          and maintaining your own Apps Script.
        </li>
        <li>
          <strong>Your content.</strong> You are solely responsible for what you store and, where
          applicable, share with others.
        </li>
      </ul>

      <h2 id="acceptable-use">4. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>violate any law, or infringe the rights of others;</li>
        <li>store or distribute unlawful, harmful, or abusive content;</li>
        <li>
          attempt to gain unauthorized access to another user&rsquo;s data, Sheet, or the master
          directory, or to disrupt the Service for others;
        </li>
        <li>misuse shared-channel access beyond what an owner has granted you.</li>
      </ul>

      <h2 id="third-party">5. Third-party services</h2>
      <p>
        Murmur depends on Google Apps Script and Google Sheets, which run under your own Google
        account. Your use of those services is governed by Google&rsquo;s applicable terms. Murmur
        is not affiliated with or endorsed by Google.
      </p>

      <h2 id="ip">6. Intellectual property &amp; license</h2>
      <p>
        The Murmur software is licensed under the Apache License 2.0. You retain all rights to the
        content you create. The &ldquo;Murmur&rdquo; name and branding are provided for
        identifying the project and do not grant trademark rights beyond the customary use
        described in the license.
      </p>

      <h2 id="warranty">7. Disclaimer of warranty</h2>
      <p>
        The Service is provided <strong>&ldquo;as is&rdquo; and &ldquo;as available,&rdquo;</strong>{" "}
        without warranties of any kind, express or implied, including merchantability, fitness for
        a particular purpose, and non-infringement. You use the Service at your own risk. While
        Murmur is designed to protect your privacy, no software is guaranteed to be error-free or
        secure, and you are responsible for maintaining your own backups (for example, via the
        built-in JSON export).
      </p>

      <h2 id="liability">8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, in no event shall the authors, contributors, or
        operators be liable for any indirect, incidental, special, consequential, or exemplary
        damages, or for any loss of data, arising out of or related to your use of the Service,
        even if advised of the possibility of such damages.
      </p>

      <h2 id="termination">9. Termination</h2>
      <p>
        You may stop using the Service at any time by signing out and deleting your local data and
        your Google Sheet. An operator may discontinue a hosted instance at any time; because your
        content lives in your own Sheet, discontinuation of an instance does not delete your data.
      </p>

      <h2 id="changes">10. Changes</h2>
      <p>
        These terms may be updated as the software evolves. Continued use after an update
        constitutes acceptance of the revised terms. The &ldquo;Last updated&rdquo; date above
        reflects the current version.
      </p>

      <h2 id="contact">11. Contact</h2>
      <p>
        Questions about these terms can be raised on the project&rsquo;s{" "}
        <a href="https://github.com/tusharmali/murmur" target="_blank" rel="noopener noreferrer">
          GitHub repository
        </a>
        .
      </p>

      <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "#8a7fb0" }}>
        This document is a template for operators of Murmur deployments and does not constitute
        legal advice. Operators should adapt it to their jurisdiction and add governing-law and
        contact details.
      </p>
    </LegalShell>
  );
}
