import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Murmur — your private message vault",
    template: "%s",
  },
  description:
    "A calm, Slack-like place to keep messages & important items. Stored locally as date-wise JSON and autosaved to your own private Google Sheet.",
  applicationName: "Murmur",
  keywords: [
    "private notes",
    "local-first",
    "end-to-end encryption",
    "Google Sheets",
    "self-hosted",
    "open source notes app",
  ],
};

export const viewport: Viewport = {
  themeColor: "#9b85d9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
