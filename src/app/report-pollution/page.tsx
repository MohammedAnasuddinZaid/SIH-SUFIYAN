import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import { ReportPollutionContent } from "./report-pollution-content"

export const metadata: Metadata = {
  title: "Report Pollution",
  description: "Citizen-powered pollution reporting tool for submitting and tracking environmental incidents on rivers and waterways.",
}

function ReportPollutionLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="mt-8 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

export default function ReportPollutionPage() {
  return (
    <Suspense fallback={<ReportPollutionLoading />}>
      <ReportPollutionContent />
    </Suspense>
  )
}
