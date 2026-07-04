import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const SITE_URL = "https://murmur-chat.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Murmur — private, local-first message & notes vault",
    template: "%s · Murmur",
  },
  description:
    "A calm, Slack-like place to keep your messages & notes. Local-first, end-to-end encrypted, and autosaved to a Google Sheet you own. No servers, no tracking, open source.",
  applicationName: "Murmur",
  authors: [{ name: "Tushar Mali" }],
  creator: "Tushar Mali",
  publisher: "Murmur",
  keywords: [
    "private notes app",
    "local-first notes",
    "end-to-end encrypted notes",
    "Google Sheets notes",
    "self-hosted notes",
    "open source Slack alternative",
    "personal knowledge vault",
    "encrypted messaging app",
    "note taking app",
    "Murmur",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Murmur",
    url: SITE_URL,
    title: "Murmur — private, local-first message & notes vault",
    description:
      "Local-first, end-to-end encrypted notes autosaved to your own Google Sheet. No servers. Open source.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Murmur — private, local-first message & notes vault",
    description:
      "Local-first, end-to-end encrypted notes autosaved to your own Google Sheet. No servers. Open source.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Murmur",
  },
  category: "productivity",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3fd" },
    { media: "(prefers-color-scheme: dark)", color: "#2a2440" },
  ],
  width: "device-width",
  initialScale: 1,
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Murmur",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web, iOS, Android, Windows, macOS, Linux",
  description:
    "A calm, private, local-first place for your messages and notes. End-to-end encrypted and autosaved to a Google Sheet you own.",
  url: SITE_URL,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  isAccessibleForFree: true,
  author: { "@type": "Person", name: "Tushar Mali" },
  sameAs: ["https://github.com/tusharmali/murmur"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegister />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </body>
    </html>
  );
}
