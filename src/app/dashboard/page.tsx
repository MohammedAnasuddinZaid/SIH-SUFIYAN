import type { Metadata } from "next"
import { Suspense } from "react"

import { DashboardSkeleton } from "@/components/shared/loading-skeleton"
import { DashboardContent } from "./dashboard-content"

export const metadata: Metadata = {
  title: "River Health Dashboard",
  description: "Monitor water quality, pollution levels and river health across all monitored zones in real time.",
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}