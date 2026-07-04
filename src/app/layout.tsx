import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Murmur — your private message vault",
  description:
    "A calm, Slack-like place to keep messages & important items. Stored locally as date-wise JSON and autosaved to your own private Google Sheet.",
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
