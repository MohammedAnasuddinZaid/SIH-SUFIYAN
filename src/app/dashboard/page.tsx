import { Suspense } from "react"

import { DashboardSkeleton } from "@/components/shared/loading-skeleton"
import { DashboardContent } from "./dashboard-content"

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}