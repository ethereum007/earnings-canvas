import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EarningsCanvas — India Earnings Intelligence",
  description:
    "Institutional-grade India earnings analysis. Q4 FY26 season tracker, sector KPIs, management commentary, and analyst verdicts.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://earningscanvas.in"
  ),
  openGraph: {
    title: "EarningsCanvas",
    description: "India earnings intelligence platform",
    url: "https://earningscanvas.in",
    siteName: "EarningsCanvas",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
