"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BellRing,
  BrainCircuit,
  ChevronDown,
  Cpu,
  Droplets,
  FileText,
  Flag,
  FlaskConical,
  Home,
  Info,
  LayoutDashboard,
  ListTodo,
  Map,
  MoreHorizontal,
  Recycle,
  Shield,
  Sparkles,
  TrendingUp,
  BarChart3,
  Menu,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavItem = {
  label: string
  href: string
  icon: typeof Home
}

const TOP_LEVEL: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "River Map", href: "/river-map", icon: Map },
  { label: "AI Detection", href: "/waste-detection", icon: BrainCircuit },
  {
    label: "Pollution Analysis",
    href: "/pollution-analysis",
    icon: FlaskConical,
  },
]

const MORE_ITEMS: NavItem[] = [
  { label: "Action Center", href: "/action-center", icon: ListTodo },
  { label: "Analytics Center", href: "/analytics", icon: BarChart3 },
  { label: "Alerts", href: "/alerts", icon: BellRing },
  { label: "AI Recommendations", href: "/recommendations", icon: Sparkles },
  { label: "Waste Management", href: "/waste-management", icon: Recycle },
  { label: "Authority", href: "/authority", icon: Shield },
  { label: "Impact", href: "/impact", icon: TrendingUp },
  { label: "My Reports", href: "/my-reports", icon: FileText },
  { label: "Technology", href: "/technology", icon: Cpu },
  { label: "About", href: "/about", icon: Info },
]

const CTA_ITEM: NavItem = {
  label: "Report Pollution",
  href: "/report-pollution",
  icon: Flag,
}

const ALL_ITEMS: NavItem[] = [...TOP_LEVEL, ...MORE_ITEMS]

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Navigation() {
  const pathname = usePathname()

  const moreActive = MORE_ITEMS.some((item) => isActive(item.href, pathname))

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c1e3a]">
      <nav className="mx-auto flex h-16 max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/90 transition-colors group-hover:bg-emerald-600">
            <Droplets className="h-5 w-5 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-[0.14em] text-white">
              JAL-SURAKSHA
            </span>
            <span className="mt-1 text-[10px] font-medium tracking-wide text-gray-400">
              Sustainable Sanitation System of Rivers
            </span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {TOP_LEVEL.map((item) => {
            const active = isActive(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-16 items-center gap-1.5 border-b-2 px-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-gray-300 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label="More pages"
                  className={cn(
                    "flex h-16 items-center gap-1 border-b-2 px-2.5 text-sm font-medium transition-colors",
                    moreActive
                      ? "border-emerald-500 text-white"
                      : "border-transparent text-gray-300 hover:text-white"
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  More
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <DropdownMenuLabel>Platform</DropdownMenuLabel>
              {MORE_ITEMS.map((item) => {
                const active = isActive(item.href, pathname)
                return (
                  <DropdownMenuItem
                    key={item.href}
                    render={<Link href={item.href} />}
                    className={cn(active && "bg-accent text-accent-foreground")}
                  >
                    <item.icon />
                    {item.label}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href={CTA_ITEM.href} />}
                variant="destructive"
                className="font-semibold"
              >
                <CTA_ITEM.icon />
                {CTA_ITEM.label}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href={CTA_ITEM.href}
            className="ml-2 inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <CTA_ITEM.icon className="h-4 w-4" />
            {CTA_ITEM.label}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Link
            href={CTA_ITEM.href}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <CTA_ITEM.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{CTA_ITEM.label}</span>
          </Link>
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="text-gray-300 hover:bg-white/10 hover:text-white"
                />
              }
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full border-l-white/10 bg-[#0c1e3a] text-gray-200 sm:max-w-sm"
            >
              <SheetTitle className="flex items-center gap-2 text-white">
                <Droplets className="h-5 w-5 text-emerald-500" />
                JAL-SURAKSHA
              </SheetTitle>
              <span className="sr-only">Navigation menu</span>
              <div className="mt-2 flex flex-col gap-1 px-1">
                {ALL_ITEMS.map((item) => {
                  const active = isActive(item.href, pathname)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/10 text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                      {item.label}
                    </Link>
                  )
                })}
                <Link
                  href={CTA_ITEM.href}
                  className="mt-2 flex items-center gap-3 rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white"
                >
                  <CTA_ITEM.icon className="h-4.5 w-4.5" />
                  {CTA_ITEM.label}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}