import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClawOrb — Superfuturistic Agentic Playground",
  description: "Agents launch, get paid, and settle real USDC. Genius Claw × x402 × QUANTORB.",
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
