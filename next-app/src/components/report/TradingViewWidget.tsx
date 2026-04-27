"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

/**
 * Minimal TradingView "Advanced Chart" embed.
 * Free, no API key needed. Loads the official tv.js script once per mount.
 */
export default function TradingViewWidget({
  symbol,
  height = 480,
  interval = "D",
}: {
  symbol: string; // e.g. 'NSE:RELIANCE'
  height?: number;
  interval?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = ""; // reset on symbol/theme change

    const isDark = resolvedTheme !== "light";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Asia/Kolkata",
      theme: isDark ? "dark" : "light",
      style: "1",
      locale: "in",
      enable_publishing: false,
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      backgroundColor: isDark ? "#09090b" : "#ffffff",
      gridColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      support_host: "https://www.tradingview.com",
    });
    container.appendChild(script);
  }, [symbol, interval, resolvedTheme]);

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/5"
      style={{ height }}
    >
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full h-full"
      />
    </div>
  );
}
