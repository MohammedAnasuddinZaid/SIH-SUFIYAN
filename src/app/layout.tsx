import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { DemoBadge } from "@/components/shared/demo-badge";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JAL-SURAKSHA — Sustainable Sanitation System of Rivers",
  description:
    "Smart river monitoring, pollution intelligence, waste management and community-driven sanitation action for cleaner rivers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          <Navigation />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <DemoBadge className="pointer-events-none fixed bottom-3 left-3 z-40 shadow-sm" />
        </TooltipProvider>
      </body>
    </html>
  );
}