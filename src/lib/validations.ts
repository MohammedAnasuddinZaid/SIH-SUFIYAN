import { z } from "zod"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const reportPollutionSchema = z.object({
  fullName: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 2, "Name must be at least 2 characters"),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email address"),
  river: z.string().min(1, "Please select a river"),
  monitoringZone: z.string().optional(),
  location: z.string().min(5, "Location must be at least 5 characters"),
  pollutionType: z.string().min(1, "Please select a pollution type"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  severity: z.enum(["Low", "Moderate", "High", "Critical"]),
  observedAt: z.string().optional(),
  consent: z
    .boolean()
    .refine((v) => v === true, "You must confirm the information is accurate"),
})

export type ReportPollutionValues = z.infer<typeof reportPollutionSchema>

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are accepted"
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File size must be less than 10 MB"
  }
  return null
}
