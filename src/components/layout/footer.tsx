"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplets } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "River Map", href: "/river-map" },
  { label: "Reports", href: "/pollution-analysis" },
  { label: "About", href: "/about" },
]

const SDG_BADGES = ["SDG 6", "SDG 11", "SDG 12", "SDG 14"]

const HIDDEN_SEGMENTS = [
  "dashboard",
  "river-map",
  "waste-detection",
  "pollution-analysis",
  "authority",
  "impact",
]

export default function Footer() {
  const pathname = usePathname()

  const segment = pathname.split("/").filter(Boolean)[0]
  if (segment && HIDDEN_SEGMENTS.includes(segment)) {
    return null
  }

  return (
    <footer className="border-t border-white/10 bg-[#0c1e3a] text-gray-300">
      <div className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <Droplets className="h-5 w-5 text-white" />
            </span>
            <span className="text-base font-bold tracking-[0.14em] text-white">
              JAL-SURAKSHA
            </span>
          </Link>
          <p className="mt-3 text-sm font-medium text-gray-400">
            Sustainable Sanitation System of Rivers
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Smart river monitoring, pollution intelligence, waste management and
            community-driven sanitation action for cleaner rivers.
          </p>
        </div>

        <div className="md:justify-self-center">
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Navigation
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-400 transition-colors hover:text-emerald-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:justify-self-end">
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            SDG References
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {SDG_BADGES.map((sdg) => (
              <Badge
                key={sdg}
                variant="outline"
                className="bg-white/5 text-gray-300"
              >
                {sdg}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-500 sm:flex-row sm:px-6 lg:px-8">
        <p>
          Prototype demonstration platform for educational purposes. Not an
          official government service.
        </p>
        <p>&copy; 2026 JAL-SURAKSHA. All rights reserved.</p>
      </div>
    </footer>
  )
}