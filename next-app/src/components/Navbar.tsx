"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Earnings", href: "/earnings" },
  { label: "Policy Alpha", href: "/policy" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium tracking-tight">
          <span className="text-white">Earnings</span>
          <span className="text-emerald-400">Canvas</span>
        </Link>
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === link.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
