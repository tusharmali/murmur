import { ImageResponse } from "next/og";

export const alt = "Murmur — private, local-first message & notes vault";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #f6f3fd 0%, #efe9fc 45%, #f7e8f6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #9b85d9, #6f54b0)",
              color: "white",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 512 512" fill="white">
              <path d="M256 116 C276 216, 296 236, 396 256 C296 276, 276 296, 256 396 C236 296, 216 276, 116 256 C216 236, 236 216, 256 116 Z" />
            </svg>
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, color: "#4b3c74" }}>Murmur</div>
        </div>

        <div
          style={{
            marginTop: 44,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#3a3350",
            maxWidth: 900,
          }}
        >
          A calm, private home for everything you jot down.
        </div>

        <div style={{ marginTop: 28, fontSize: 32, color: "#6f54b0", maxWidth: 940 }}>
          Local-first · end-to-end encrypted · autosaved to a Google Sheet you own · open source
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 80,
            fontSize: 28,
            color: "#8369c8",
            fontWeight: 600,
          }}
        >
          murmur-chat.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
