import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClawOrb — Evidence-first intelligence for agents",
  description:
    "Source-backed research and claim verification for autonomous agents. Inspect evidence, uncertainty, and implementation status.",
  applicationName: "ClawOrb",
  openGraph: {
    title: "ClawOrb — Evidence is the edge",
    description:
      "Evidence-first research and claim verification for autonomous agents.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
