import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcPctSurprise(
  act: number | null | undefined,
  est: number | null | undefined
): number | null {
  if (act == null || est == null || est === 0) return null;
  return Math.round(((act - est) / est) * 1000) / 10; // one decimal
}

export function formatCr(val: number | null | undefined): string {
  if (val == null) return "—";
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L Cr`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K Cr`;
  return `₹${val} Cr`;
}

export function resultStatusColor(status: string): string {
  switch (status) {
    case "BEAT":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "MISS":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    case "IN LINE":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    default:
      return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
  }
}

export function surpriseColor(pct: number | null): string {
  if (pct === null) return "text-zinc-500";
  if (pct > 2) return "text-emerald-400";
  if (pct < -2) return "text-red-400";
  return "text-amber-400";
}

export function signalDotColor(color: string): string {
  const map: Record<string, string> = {
    green: "bg-emerald-400",
    red: "bg-red-400",
    amber: "bg-amber-400",
    blue: "bg-blue-400",
    gray: "bg-zinc-500",
  };
  return map[color] || "bg-zinc-500";
}

export function sentimentBadge(sentiment: string | null): string {
  switch (sentiment) {
    case "positive":
      return "text-emerald-400 bg-emerald-400/10";
    case "negative":
      return "text-red-400 bg-red-400/10";
    default:
      return "text-amber-400 bg-amber-400/10";
  }
}
