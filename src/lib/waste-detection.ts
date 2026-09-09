export interface Detection {
  id: string;
  label: string;
  category: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  estimatedWeightKg: number;
}

export interface WasteAnalysisResult {
  id: string;
  createdAt: string;
  model: string;
  modelVersion: string;
  mode: "demo";
  overallConfidence: number;
  category: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  detections: Detection[];
  detectedObjectCount: number;
  estimatedWeightKg: number;
  processingTimeMs: number;
  recommendations: string[];
  evidence: string[];
}

export interface SegregationRecommendation {
  destination: string;
  handling: string;
  priority: string;
}

const SAMPLE_ID_PREFIX = "demo-analysis";

function makeDetection(
  id: string,
  label: string,
  category: string,
  confidence: number,
  boundingBox: Detection["boundingBox"],
  estimatedWeightKg: number
): Detection {
  return { id, label, category, confidence, boundingBox, estimatedWeightKg };
}

function makeResult(
  idSuffix: string,
  createdAt: string,
  category: string,
  overallConfidence: number,
  riskLevel: WasteAnalysisResult["riskLevel"],
  detections: Detection[],
  processingTimeMs: number,
  recommendations: string[],
  evidence: string[]
): WasteAnalysisResult {
  const estimatedWeightKg =
    Math.round(detections.reduce((s, d) => s + d.estimatedWeightKg, 0) * 100) / 100;
  return {
    id: `${SAMPLE_ID_PREFIX}-${idSuffix}`,
    createdAt,
    model: "Demo Waste Classifier",
    modelVersion: "demo-1",
    mode: "demo",
    overallConfidence,
    category,
    riskLevel,
    detections,
    detectedObjectCount: detections.length,
    estimatedWeightKg,
    processingTimeMs,
    recommendations,
    evidence,
  };
}

const plasticDetections: Detection[] = [
  makeDetection("det-pl-1", "PET Bottle", "Plastic", 0.96, { x: 0.12, y: 0.18, width: 0.15, height: 0.22 }, 0.02),
  makeDetection("det-pl-2", "PET Bottle", "Plastic", 0.94, { x: 0.35, y: 0.10, width: 0.12, height: 0.25 }, 0.02),
  makeDetection("det-pl-3", "PET Bottle", "Plastic", 0.93, { x: 0.55, y: 0.22, width: 0.14, height: 0.20 }, 0.02),
  makeDetection("det-pl-4", "PET Bottle", "Plastic", 0.95, { x: 0.20, y: 0.50, width: 0.13, height: 0.24 }, 0.02),
  makeDetection("det-pl-5", "PET Bottle", "Plastic", 0.92, { x: 0.70, y: 0.35, width: 0.11, height: 0.23 }, 0.02),
  makeDetection("det-pl-6", "PET Bottle", "Plastic", 0.91, { x: 0.48, y: 0.60, width: 0.14, height: 0.21 }, 0.02),
  makeDetection("det-pl-7", "Plastic Bag", "Plastic", 0.88, { x: 0.62, y: 0.55, width: 0.18, height: 0.12 }, 0.01),
  makeDetection("det-pl-8", "Plastic Bag", "Plastic", 0.86, { x: 0.28, y: 0.72, width: 0.20, height: 0.10 }, 0.01),
];

const organicDetections: Detection[] = [
  makeDetection("det-org-1", "Food Waste", "Organic", 0.91, { x: 0.15, y: 0.20, width: 0.18, height: 0.16 }, 0.15),
  makeDetection("det-org-2", "Food Waste", "Organic", 0.88, { x: 0.40, y: 0.30, width: 0.22, height: 0.14 }, 0.12),
  makeDetection("det-org-3", "Food Waste", "Organic", 0.87, { x: 0.65, y: 0.15, width: 0.16, height: 0.18 }, 0.10),
  makeDetection("det-org-4", "Food Waste", "Organic", 0.85, { x: 0.25, y: 0.55, width: 0.20, height: 0.15 }, 0.13),
  makeDetection("det-org-5", "Vegetation", "Organic", 0.90, { x: 0.50, y: 0.60, width: 0.25, height: 0.18 }, 0.08),
  makeDetection("det-org-6", "Vegetation", "Organic", 0.89, { x: 0.10, y: 0.70, width: 0.22, height: 0.14 }, 0.06),
  makeDetection("det-org-7", "Vegetation", "Organic", 0.86, { x: 0.72, y: 0.65, width: 0.18, height: 0.16 }, 0.07),
];

const mixedDetections: Detection[] = [
  makeDetection("det-mix-1", "Plastic Bottle", "Plastic", 0.68, { x: 0.10, y: 0.15, width: 0.12, height: 0.20 }, 0.02),
  makeDetection("det-mix-2", "Plastic Wrapper", "Plastic", 0.55, { x: 0.30, y: 0.25, width: 0.16, height: 0.12 }, 0.01),
  makeDetection("det-mix-3", "Food Scraps", "Organic", 0.74, { x: 0.52, y: 0.18, width: 0.14, height: 0.16 }, 0.10),
  makeDetection("det-mix-4", "Leaf Litter", "Organic", 0.68, { x: 0.20, y: 0.50, width: 0.20, height: 0.14 }, 0.05),
  makeDetection("det-mix-5", "Organic Debris", "Organic", 0.70, { x: 0.65, y: 0.45, width: 0.18, height: 0.15 }, 0.08),
  makeDetection("det-mix-6", "Aluminum Can", "Metal", 0.80, { x: 0.42, y: 0.60, width: 0.10, height: 0.14 }, 0.01),
  makeDetection("det-mix-7", "Metal Scrap", "Metal", 0.75, { x: 0.75, y: 0.25, width: 0.12, height: 0.18 }, 0.03),
  makeDetection("det-mix-8", "Mixed Debris", "Mixed", 0.50, { x: 0.15, y: 0.72, width: 0.22, height: 0.12 }, 0.06),
  makeDetection("det-mix-9", "Paper Scrap", "Mixed", 0.58, { x: 0.55, y: 0.75, width: 0.16, height: 0.10 }, 0.02),
];

const industrialDetections: Detection[] = [
  makeDetection("det-ind-1", "Chemical Container", "Industrial", 0.90, { x: 0.10, y: 0.12, width: 0.18, height: 0.24 }, 0.35),
  makeDetection("det-ind-2", "Chemical Container", "Industrial", 0.87, { x: 0.40, y: 0.08, width: 0.16, height: 0.26 }, 0.30),
  makeDetection("det-ind-3", "Metal Scrap", "Industrial", 0.85, { x: 0.62, y: 0.20, width: 0.20, height: 0.18 }, 0.45),
  makeDetection("det-ind-4", "Metal Scrap", "Industrial", 0.82, { x: 0.22, y: 0.55, width: 0.22, height: 0.20 }, 0.50),
  makeDetection("det-ind-5", "Metal Scrap", "Industrial", 0.80, { x: 0.58, y: 0.60, width: 0.18, height: 0.22 }, 0.40),
];

const unknownDetections: Detection[] = [
  makeDetection("det-unk-1", "Unidentified Material", "Unknown", 0.52, { x: 0.15, y: 0.20, width: 0.20, height: 0.18 }, 0.05),
  makeDetection("det-unk-2", "Unidentified Material", "Unknown", 0.44, { x: 0.50, y: 0.30, width: 0.18, height: 0.16 }, 0.03),
  makeDetection("det-unk-3", "Unidentified Material", "Unknown", 0.48, { x: 0.30, y: 0.60, width: 0.22, height: 0.14 }, 0.04),
];

export function analyzeImage(kind: "plastic" | "organic" | "mixed" | "industrial" | "unknown"): WasteAnalysisResult {
  switch (kind) {
    case "plastic":
      return makeResult(
        "plastic-001",
        "2026-09-09T08:30:00Z",
        "Plastic Waste",
        0.94,
        "HIGH",
        plasticDetections,
        1800,
        [
          "Route plastic waste to authorized recycling facilities",
          "Separate PET bottles for material recovery",
          "Report accumulation hotspot to local sanitation authority",
          "Deploy collection bins at high-traffic dumping locations",
        ],
        [
          "High density of PET bottles detected in cluster formation",
          "Consistent plastic composition across detected objects",
          "Spatial pattern suggests systematic dumping activity",
          "Weight estimation within expected range for plastic waste",
        ]
      );
    case "organic":
      return makeResult(
        "organic-001",
        "2026-09-09T09:15:00Z",
        "Organic Waste",
        0.89,
        "MODERATE",
        organicDetections,
        1500,
        [
          "Direct organic waste to composting or bio-digester facilities",
          "Monitor decomposition-related water quality impact",
          "Coordinate with municipal organic waste collection",
        ],
        [
          "Food waste and vegetation debris detected in natural setting",
          "Organic matter showing early decomposition signs",
          "No hazardous material contamination observed",
          "Spatial distribution consistent with natural accumulation",
        ]
      );
    case "mixed":
      return makeResult(
        "mixed-001",
        "2026-09-09T10:00:00Z",
        "Mixed Waste",
        0.71,
        "HIGH",
        mixedDetections,
        2200,
        [
          "Requires manual segregation before disposal routing",
          "Separate recyclable metals from organic and plastic waste",
          "Coordinate multi-stream waste processing",
          "Flag area for priority cleanup intervention",
        ],
        [
          "Multiple waste categories detected in single area",
          "Plastic and organic contamination overlap detected",
          "Metal components suggest mixed household waste stream",
          "Overall classification confidence moderate due to category overlap",
        ]
      );
    case "industrial":
      return makeResult(
        "industrial-001",
        "2026-09-09T11:30:00Z",
        "Industrial Waste",
        0.86,
        "HIGH",
        industrialDetections,
        2500,
        [
          "Route to authorized industrial waste handling facility",
          "Do not mix with municipal waste streams",
          "Report to pollution control board for source tracing",
          "Ensure hazmat handling protocols are followed",
        ],
        [
          "Chemical container remnants detected with industrial markings",
          "Heavy metal scrap indicates industrial origin",
          "Weight profile consistent with industrial waste stream",
          "No residential waste mixed in detected objects",
        ]
      );
    case "unknown":
      return makeResult(
        "unknown-001",
        "2026-09-09T12:00:00Z",
        "Unknown",
        0.48,
        "LOW",
        unknownDetections,
        1200,
        [
          "Low-confidence classification. Consider manual verification.",
          "Flag for human review before disposal decision",
          "Collect additional imagery from multiple angles if possible",
        ],
        [
          "Low-confidence classification. Consider manual verification.",
          "Image quality or unusual object shapes may have reduced confidence",
          "Insufficient feature matching against trained categories",
        ]
      );
  }
}

export function getSegregationRecommendation(category: string): SegregationRecommendation {
  switch (category) {
    case "Plastic":
      return {
        destination: "Recycling Facility",
        handling: "Route to authorized plastic recycling center for material recovery and processing",
        priority: "High",
      };
    case "Organic":
      return {
        destination: "Composting / Bio-digester",
        handling: "Direct to organic waste composting facility or anaerobic bio-digester",
        priority: "Medium",
      };
    case "Industrial":
      return {
        destination: "Authorized Industrial Handling",
        handling: "Route to certified industrial waste management facility with hazmat capabilities",
        priority: "Urgent",
      };
    case "Sewage":
      return {
        destination: "Wastewater Treatment Plant",
        handling: "Direct to sewage treatment facility for biological and chemical processing",
        priority: "High",
      };
    case "Mixed":
      return {
        destination: "Manual Segregation Center",
        handling: "Route to manual segregation facility for categorization before disposal routing",
        priority: "High",
      };
    case "Metal":
      return {
        destination: "Metal Recycling Facility",
        handling: "Route to metal recycling center for smelting and material recovery",
        priority: "Medium",
      };
    case "Hazardous":
      return {
        destination: "Authorized Hazardous-Waste Handling",
        handling: "Route to government-certified hazardous waste disposal facility with proper containment",
        priority: "Urgent",
      };
    default:
      return {
        destination: "Manual Inspection",
        handling: "Requires human inspection to determine appropriate disposal pathway",
        priority: "Low",
      };
  }
}

export interface AnalysisHistoryEntry {
  id: string;
  category: string;
  confidence: number;
  risk: string;
  timestamp: string;
  status: string;
}

export const demoAnalysisHistory: AnalysisHistoryEntry[] = [
  { id: "demo-analysis-plastic-001", category: "Plastic Waste", confidence: 0.94, risk: "HIGH", timestamp: "2026-09-09T08:30:00Z", status: "completed" },
  { id: "demo-analysis-organic-001", category: "Organic Waste", confidence: 0.89, risk: "MODERATE", timestamp: "2026-09-09T09:15:00Z", status: "completed" },
  { id: "demo-analysis-mixed-001", category: "Mixed Waste", confidence: 0.71, risk: "HIGH", timestamp: "2026-09-09T10:00:00Z", status: "completed" },
  { id: "demo-analysis-industrial-001", category: "Industrial Waste", confidence: 0.86, risk: "HIGH", timestamp: "2026-09-09T11:30:00Z", status: "completed" },
];

export function getWasteRiskScore(result: WasteAnalysisResult): { score: number; level: string } {
  const confidenceWeight = 0.3;
  const objectCountWeight = 0.2;
  const weightWeight = 0.25;
  const categoryWeight = 0.25;

  const confidenceScore = result.overallConfidence * 100;

  const objectScore = Math.min(result.detectedObjectCount * 10, 100);

  const weightScore = Math.min(result.estimatedWeightKg * 20, 100);

  const categoryMap: Record<string, number> = {
    "Plastic Waste": 75,
    "Organic Waste": 40,
    "Mixed Waste": 80,
    "Industrial Waste": 90,
    Unknown: 20,
  };
  const categoryScore = categoryMap[result.category] ?? 30;

  const score = Math.round(
    confidenceScore * confidenceWeight +
      objectScore * objectCountWeight +
      weightScore * weightWeight +
      categoryScore * categoryWeight
  );

  let level: string;
  if (score >= 70) level = "High";
  else if (score >= 45) level = "Medium";
  else level = "Low";

  return { score: Math.min(score, 100), level };
}
