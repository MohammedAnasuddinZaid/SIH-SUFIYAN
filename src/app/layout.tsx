import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { DemoBadge } from "@/components/shared/demo-badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PwaInstallButton } from "@/components/shared/pwa-install-button";
import { ServiceWorkerRegistration } from "@/components/shared/service-worker-registration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JAL-SURAKSHA — Sustainable Sanitation System of Rivers",
    template: "%s | JAL-SURAKSHA",
  },
  description:
    "Smart river monitoring, pollution intelligence, waste management and community-driven sanitation action for cleaner rivers.",
  keywords: [
    "river monitoring",
    "pollution detection",
    "waste management",
    "water quality",
    "environmental intelligence",
    "sanitation",
    "smart city",
    "India",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JAL-SURAKSHA",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "JAL-SURAKSHA",
    title: "JAL-SURAKSHA — Sustainable Sanitation System of Rivers",
    description:
      "Smart monitoring, intelligent waste management, and community-driven action for cleaner and healthier rivers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JAL-SURAKSHA — Sustainable Sanitation System of Rivers",
    description:
      "Smart monitoring, intelligent waste management, and community-driven action for cleaner and healthier rivers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1e3a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ServiceWorkerRegistration />
        <TooltipProvider>
          <Navigation />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <DemoBadge className="pointer-events-none fixed bottom-3 left-3 z-40 shadow-sm" />
          <PwaInstallButton />
        </TooltipProvider>
      </body>
    </html>
  );
}