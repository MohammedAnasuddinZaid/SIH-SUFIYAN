"use client"

import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  Upload,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { rivers } from "@/lib/demo-data/rivers"
import { getZonesByRiver } from "@/lib/demo-data/monitoring-zones"
import { pollutionReports } from "@/lib/demo-data/reports"
import type { PollutionType, Severity } from "@/lib/types"
import { reportPollutionSchema, type ReportPollutionValues, validatePhotoFile } from "@/lib/validations"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DemoBadge } from "@/components/shared/demo-badge"

const POLLUTION_TYPES: { value: PollutionType; label: string }[] = [
  { value: "Plastic", label: "Plastic Waste" },
  { value: "Domestic Sewage", label: "Sewage" },
  { value: "Industrial", label: "Industrial Discharge" },
  { value: "Chemical", label: "Chemical Pollution" },
  { value: "Organic", label: "Organic Waste" },
  { value: "Mixed", label: "Mixed Waste" },
  { value: "Agricultural", label: "Agricultural Runoff" },
  { value: "Oil Spill", label: "Oil Spill" },
]

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: "Low", label: "Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
]

function generateReportNumber(): string {
  const maxNum = pollutionReports.reduce((max, r) => {
    const match = r.reportNumber.match(/JS-2026-(\d+)/)
    return match ? Math.max(max, parseInt(match[1], 10)) : max
  }, 0)
  return `JS-2026-${String(maxNum + 1).padStart(5, "0")}`
}

interface PhotoPreview {
  file: File
  url: string
  error?: string
}

export function ReportPollutionContent() {
  const searchParams = useSearchParams()

  const paramRiver = searchParams.get("river") ?? ""
  const paramZone = searchParams.get("zone") ?? ""

  const [selectedRiver, setSelectedRiver] = useState(paramRiver)
  const [selectedZone, setSelectedZone] = useState(paramZone)
  const [severity, setSeverity] = useState<Severity>("Moderate")
  const [pollutionType, setPollutionType] = useState("")
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedReportNumber, setSubmittedReportNumber] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<{
    reportNumber: string
    id: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const zones = selectedRiver ? getZonesByRiver(selectedRiver) : []

  const selectedZoneData = selectedZone
    ? zones.find((z) => z.id === selectedZone)
    : null

  function checkDuplicate(type: string, riverId: string) {
    if (!type || !riverId) {
      setDuplicateWarning(null)
      return
    }
    const duplicate = pollutionReports.find(
      (r) =>
        r.pollutionType === type &&
        r.riverId === riverId &&
        !["resolved"].includes(r.status)
    )
    if (duplicate) {
      setDuplicateWarning({
        reportNumber: duplicate.reportNumber,
        id: duplicate.id,
      })
    } else {
      setDuplicateWarning(null)
    }
  }

  function handleRiverChange(value: string | null) {
    const v = value ?? ""
    setSelectedRiver(v)
    setSelectedZone("")
    if (pollutionType) {
      checkDuplicate(pollutionType, v)
    }
  }

  function handlePollutionTypeChange(value: string | null) {
    const v = value ?? ""
    setPollutionType(v)
    if (selectedRiver) {
      checkDuplicate(v, selectedRiver)
    }
  }

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const newPhotos: PhotoPreview[] = []
    for (const file of Array.from(files)) {
      const error = validatePhotoFile(file)
      newPhotos.push({
        file,
        url: URL.createObjectURL(file),
        error: error ?? undefined,
      })
    }
    setPhotos((prev) => [...prev, ...newPhotos])

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed.url)
      return prev.filter((_, i) => i !== index)
    })
  }

  function validateForm(form: HTMLFormElement): Record<string, string> {
    const formData = new FormData(form)
    const values: ReportPollutionValues = {
      fullName: (formData.get("fullName") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      river: selectedRiver,
      monitoringZone: selectedZone || undefined,
      location: formData.get("location") as string,
      pollutionType,
      description: formData.get("description") as string,
      severity,
      observedAt: (formData.get("observedAt") as string) || undefined,
      consent: formData.get("consent") === "on",
    }

    const result = reportPollutionSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0]
        if (typeof path === "string" && !fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }
      return fieldErrors
    }
    return {}
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)

    const form = e.currentTarget
    const validationErrors = validateForm(form)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const hasPhotoErrors = photos.some((p) => p.error)
    if (hasPhotoErrors) {
      setErrors({ photos: "Please remove invalid photos before submitting" })
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      const reportNumber = generateReportNumber()
      setSubmittedReportNumber(reportNumber)
    } catch {
      setSubmitError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setSelectedRiver("")
    setSelectedZone("")
    setSeverity("Moderate")
    setPollutionType("")
    setPhotos([])
    setErrors({})
    setSubmitError(null)
    setDuplicateWarning(null)
    setSubmittedReportNumber(null)
    if (formRef.current) formRef.current.reset()
  }

  if (submittedReportNumber) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-[#0c1e3a]">
              Report Submitted
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
              Your pollution report has been received and is being reviewed by
              authorities.
            </p>

            <div className="mt-6 w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <span className="text-sm text-slate-500">Report ID</span>
                <span className="font-mono text-sm font-semibold text-[#0c1e3a]">
                  {submittedReportNumber}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <span className="text-sm text-slate-500">Status</span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Submitted
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                render={
                  <Link href={`/reports/${submittedReportNumber}`} />
                }
              >
                <FileText className="h-4 w-4" />
                View Report
              </Button>
              <Button
                variant="outline"
                render={
                  <Link href={`/reports/${submittedReportNumber}`} />
                }
              >
                Track Status
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Report Another Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a]">
            Report Pollution
          </h1>
          <DemoBadge />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Help authorities identify and prioritize sanitation issues near our
          rivers.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-700">
            Your report helps authorities identify and prioritize sanitation
            issues.
          </p>
        </div>
      </header>

      {duplicateWarning && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-amber-800">
              Potential duplicate found ({duplicateWarning.reportNumber})
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link href={`/reports/${duplicateWarning.reportNumber}`} />
                }
                className="border-amber-300 bg-white text-amber-700 hover:bg-amber-50"
              >
                View existing report
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDuplicateWarning(null)}
                className="text-amber-700 hover:bg-amber-100"
              >
                Continue anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{submitError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubmitError(null)}
              className="mt-1 text-red-700 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-5 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (optional)</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Your name"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                River <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedRiver} onValueChange={handleRiverChange}>
                <SelectTrigger
                  className="w-full"
                  aria-label="Select river"
                >
                  <SelectValue placeholder="Select a river" />
                </SelectTrigger>
                <SelectContent>
                  {rivers.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.river && (
                <p className="text-xs text-red-600">{errors.river}</p>
              )}
            </div>

            {selectedRiver && zones.length > 0 && (
              <div className="space-y-2">
                <Label>Monitoring Zone (recommended)</Label>
                <Select
                  value={selectedZone}
                  onValueChange={(v) => setSelectedZone(v ?? "")}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label="Select monitoring zone"
                  >
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Selecting a zone helps authorities respond faster.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Near the bridge at Mozamjahi Market"
                defaultValue={selectedZoneData?.name ?? ""}
              />
              {errors.location && (
                <p className="text-xs text-red-600">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Pollution Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={pollutionType}
                onValueChange={handlePollutionTypeChange}
              >
                <SelectTrigger
                  className="w-full"
                  aria-label="Select pollution type"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {POLLUTION_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      {pt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pollutionType && (
                <p className="text-xs text-red-600">{errors.pollutionType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what you observed — type of waste, approximate area affected, any visible sources, etc."
                rows={4}
              />
              {errors.description && (
                <p className="text-xs text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Severity <span className="text-red-500">*</span>
              </Label>
              <Select
                value={severity}
                onValueChange={(v) => v && setSeverity(v as Severity)}
              >
                <SelectTrigger className="w-full" aria-label="Select severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Photos (optional)</Label>
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50/30"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Click to upload photos
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  JPEG, PNG, WebP, GIF — max 10 MB each
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoAdd}
              />
              {errors.photos && (
                <p className="text-xs text-red-600">{errors.photos}</p>
              )}

              {photos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.url}
                      className={cn(
                        "group relative overflow-hidden rounded-lg border",
                        photo.error
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200"
                      )}
                    >
                      {photo.error ? (
                        <div className="flex h-24 flex-col items-center justify-center px-2 text-center">
                          <Upload className="h-4 w-4 text-red-400" />
                          <p className="mt-1 text-[10px] text-red-500">
                            {photo.error}
                          </p>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photo.url}
                          alt={`Upload ${idx + 1}`}
                          className="h-24 w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observedAt">When did you observe this?</Label>
              <Input
                id="observedAt"
                name="observedAt"
                type="date"
                className="w-full sm:w-48"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="consent"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">
                  I confirm the information provided is accurate to the best of
                  my knowledge.
                </span>
              </label>
              {errors.consent && (
                <p className="text-xs text-red-600">{errors.consent}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Clear form
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
