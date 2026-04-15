import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company") ?? "EarningsCanvas";
  const status = searchParams.get("status") ?? "AWAITED";
  const score = searchParams.get("score") ?? "—";
  const sector = searchParams.get("sector") ?? "";

  const statusColor =
    status === "BEAT" ? "#34d399" : status === "MISS" ? "#f87171" : "#fbbf24";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 14,
            letterSpacing: 2,
          }}
        >
          EARNINGSCANVAS · Q4 FY26
        </div>
        <div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 56,
              fontWeight: 500,
              marginBottom: 12,
              lineHeight: 1.1,
            }}
          >
            {company}
          </div>
          {sector && (
            <div style={{ color: "#71717a", fontSize: 18, marginBottom: 16 }}>
              {sector}
            </div>
          )}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span
              style={{
                color: statusColor,
                background: `${statusColor}20`,
                border: `1px solid ${statusColor}40`,
                padding: "6px 16px",
                borderRadius: 24,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {status}
            </span>
            {score !== "—" && (
              <span style={{ color: "#71717a", fontSize: 14 }}>
                Verdict score{" "}
                <span style={{ color: "#ffffff", fontWeight: 500 }}>
                  {score}/10
                </span>
              </span>
            )}
          </div>
        </div>
        <div style={{ color: "#3f3f46", fontSize: 13 }}>earningscanvas.in</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
