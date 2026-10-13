import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET(req: Request) {
  const logo = new URL("/brand/aica-logo.png", req.url).href;
  const dot = (c: string, x: number, y: number) => (
    <div style={{ position: "absolute", left: x, top: y, width: 120, height: 120, borderRadius: 999, background: c, boxShadow: `0 0 120px ${c}` }} />
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f6f7fb", position: "relative", fontFamily: "serif" }}>
        <div style={{ position: "absolute", right: 60, top: 70, width: 520, height: 480, display: "flex" }}>
          <svg width="520" height="480" viewBox="0 0 520 480" style={{ position: "absolute", left: 0, top: 0 }}>
            <path d="M120 140 L400 140 L260 400 Z" fill="none" stroke="#2f4fb0" strokeOpacity="0.35" strokeWidth="4" strokeDasharray="14 14" />
          </svg>
          {dot("#ff6b4a", 60, 80)}
          {dot("#5b6cff", 340, 80)}
          {dot("#10b981", 200, 340)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 700 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={260} height={125} alt="AICA" style={{ marginLeft: -16 }} />
          <div style={{ fontSize: 84, lineHeight: 1.02, color: "#0b1530", marginTop: 28, display: "flex", flexDirection: "column" }}>
            <span>One ecosystem.</span>
            <span>Three sides.</span>
            <span style={{ color: "#2f4fb0", fontStyle: "italic" }}>Better care.</span>
          </div>
          <div style={{ fontSize: 28, color: "#56607c", marginTop: 30 }}>Patients · Pharmacies · Clinics — made in Lucknow</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
