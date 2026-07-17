import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/**
 * Static Open Graph image, generated at build time with next/og (Satori). No
 * external service is called: the layout is inline and the typeface is the
 * app's own self-hosted Atkinson Hyperlegible, read from node_modules. Next
 * wires this into OG + Twitter metadata for every route automatically.
 */
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontData = readFileSync(
  join(
    process.cwd(),
    "node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff"
  )
);

// Waveform bar heights (px) — the product's signature motif, static here.
const BARS = [64, 132, 96, 190, 120, 220, 150, 88, 176, 110, 60];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0B1519",
          padding: "72px 80px",
          fontFamily: "Atkinson Hyperlegible",
          color: "#E8F1F2",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            height: 220,
          }}
        >
          {BARS.map((height, index) => (
            <div
              key={index}
              style={{
                width: 20,
                height,
                borderRadius: 9999,
                backgroundColor: index === 5 ? "#FBBF24" : "#2DD4BF",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.05 }}>{SITE.name}</div>
          <div
            style={{
              fontSize: 40,
              lineHeight: 1.2,
              color: "#9FB6BC",
              marginTop: 16,
              maxWidth: 900,
            }}
          >
            Read text, PDFs and subtitles aloud in your browser. Free, open
            source, no upload.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "#2DD4BF" }}>
          voicekit.mkazi.live
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Atkinson Hyperlegible",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
