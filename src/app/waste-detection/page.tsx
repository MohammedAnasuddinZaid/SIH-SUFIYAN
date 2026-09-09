"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  ImageIcon,
  Trash2,
  RotateCcw,
  ScanLine,
  AlertTriangle,
  Info,
  MapPin,
  FileText,
  Zap,
  CheckCircle2,
  Loader2,
  FlaskConical,
  Bot,
  Leaf,
  Factory,
  Layers,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DemoBadge } from "@/components/shared/demo-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/empty-state";
import { rivers } from "@/lib/demo-data/rivers";
import {
  getRiverSummary,
  getZonesByRiverSelector,
} from "@/lib/selectors";
import {
  analyzeImage,
  getSegregationRecommendation,
  demoAnalysisHistory,
  type WasteAnalysisResult,
  type SegregationRecommendation,
} from "@/lib/waste-detection";

type AnalysisStage = "idle" | "validating" | "analyzing" | "complete";

const PROGRESS_STAGES = [
  "Preparing image",
  "Analyzing image",
  "Detecting waste",
  "Estimating risk",
  "Generating recommendations",
  "Complete",
];

interface SampleCard {
  kind: "plastic" | "organic" | "mixed" | "industrial";
  label: string;
  icon: React.ReactNode;
  gradient: string;
}

const SAMPLE_CARDS: SampleCard[] = [
  { kind: "plastic", label: "Plastic Bottles", icon: <Package className="h-6 w-6" />, gradient: "from-blue-500 to-cyan-400" },
  { kind: "mixed", label: "Mixed Riverbank Waste", icon: <Layers className="h-6 w-6" />, gradient: "from-amber-500 to-orange-400" },
  { kind: "organic", label: "Organic Waste", icon: <Leaf className="h-6 w-6" />, gradient: "from-green-500 to-emerald-400" },
  { kind: "industrial", label: "Industrial Waste", icon: <Factory className="h-6 w-6" />, gradient: "from-red-500 to-rose-400" },
];

const CATEGORY_OPTIONS = [
  "Plastic",
  "Organic",
  "Mixed",
  "Industrial",
  "Sewage",
  "Metal",
  "Hazardous",
];

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return "High";
  if (confidence >= 0.65) return "Medium";
  return "Low";
}

function getSeverityForDetection(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("chemical") || l.includes("industrial")) return "High";
  if (l.includes("plastic") || l.includes("metal")) return "Moderate";
  if (l.includes("organic") || l.includes("vegetation") || l.includes("food")) return "Low";
  return "Moderate";
}

export default function WasteDetectionPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <WasteDetectionContent />
    </div>
  );
}

function WasteDetectionContent() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [progressIndex, setProgressIndex] = useState(0);
  const [result, setResult] = useState<WasteAnalysisResult | null>(null);
  const [sampleKind, setSampleKind] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [segregation, setSegregation] = useState<SegregationRecommendation | null>(null);
  const [originalCategory, setOriginalCategory] = useState<string>("");
  const [selectedRiver, setSelectedRiver] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [showWhyDialog, setShowWhyDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const zones = selectedRiver ? getZonesByRiverSelector(selectedRiver) : [];
  const riverSummary = selectedRiver ? getRiverSummary(selectedRiver) : null;
  const selectedZoneData = zones.find((z) => z.id === selectedZone);

  const cleanupPreview = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      cleanupPreview();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [cleanupPreview]);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "Only image files are accepted.";
    if (file.size > 10 * 1024 * 1024) return "File size must be under 10 MB.";
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      cleanupPreview();
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      setError(null);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setSampleKind(null);
      setStage("idle");
      setResult(null);
      setProgressIndex(0);
    },
    [cleanupPreview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveImage = () => {
    cleanupPreview();
    setImageFile(null);
    setImagePreview(null);
    setSampleKind(null);
    setError(null);
    setStage("idle");
    setResult(null);
    setProgressIndex(0);
  };

  const runAnalysis = (kind?: "plastic" | "organic" | "mixed" | "industrial" | "unknown") => {
    setStage("validating");
    setProgressIndex(0);
    setResult(null);

    let idx = 0;
    progressTimerRef.current = setInterval(() => {
      idx++;
      if (idx < PROGRESS_STAGES.length) {
        setProgressIndex(idx);
        if (idx === 1) setStage("analyzing");
      } else {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        const analysisKind = kind ?? "plastic";
        const r = analyzeImage(analysisKind);
        setResult(r);
        setSelectedCategory(r.category.replace(" Waste", ""));
        setOriginalCategory(r.category.replace(" Waste", ""));
        setSegregation(getSegregationRecommendation(r.category.replace(" Waste", "")));
        setStage("complete");
      }
    }, 500);
  };

  const handleSampleClick = (kind: "plastic" | "organic" | "mixed" | "industrial") => {
    cleanupPreview();
    setImagePreview(null);
    setImageFile(null);
    setError(null);
    setSampleKind(kind);
    setStage("idle");
    setResult(null);
    setProgressIndex(0);
    setTimeout(() => {
      runAnalysis(kind);
    }, 150);
  };

  const handleCategoryChange = (value: string | null) => {
    const v = value ?? "";
    setSelectedCategory(v);
    if (result) {
      setOriginalCategory(result.category.replace(" Waste", ""));
      setSegregation(getSegregationRecommendation(v));
    }
  };

  const progressValue = stage === "idle" ? 0 : Math.round((progressIndex / (PROGRESS_STAGES.length - 1)) * 100);
  const isAnalyzing = stage === "validating" || stage === "analyzing";

  return (
    <div className="space-y-8">
      <style>{`
        .scanline-animation {
          position: relative;
          overflow: hidden;
          pointer-events: none;
        }
        .scanline-animation::after {
          content: "";
          position: absolute;
          inset-inline: 0;
          top: -30%;
          height: 25%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(34, 197, 94, 0.55),
            rgba(34, 197, 94, 0.15),
            transparent
          );
          animation: jal-suraksha-scan 1.8s linear infinite;
        }
        @keyframes jal-suraksha-scan {
          0% { transform: translateY(-10%); }
          100% { transform: translateY(520%); }
        }
      `}</style>
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            AI Waste Detection &amp; Segregation
          </h1>
          <Badge variant="secondary" className="gap-1">
            <FlaskConical className="h-3 w-3" />
            Prototype AI
          </Badge>
          <DemoBadge />
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Upload environmental waste imagery to classify material, estimate risk, and recommend the appropriate sanitation pathway.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Upload */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag & Drop Zone */}
              {!imagePreview && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
                >
                  <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium">Drop an image here or click to browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG up to 10 MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Preview */}
              {(imagePreview || sampleKind) && (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-lg border">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Uploaded waste sample"
                        className="h-48 w-full object-cover sm:h-64"
                      />
                    ) : (
                      <div
                        className={`flex h-48 w-full items-center justify-center bg-gradient-to-br sm:h-64 ${
                          SAMPLE_CARDS.find((s) => s.kind === sampleKind)?.gradient ?? "from-gray-500 to-slate-400"
                        }`}
                      >
                        <ScanLine className="h-10 w-10 text-white/70" />
                      </div>
                    )}
                    {stage === "complete" && result && imagePreview && (
                      <div className="absolute inset-0">
                        {result.detections.map((det) => (
                          <div
                            key={det.id}
                            className="absolute border-2 border-dashed border-primary/60 bg-primary/10"
                            style={{
                              left: `${det.boundingBox.x * 100}%`,
                              top: `${det.boundingBox.y * 100}%`,
                              width: `${det.boundingBox.width * 100}%`,
                              height: `${det.boundingBox.height * 100}%`,
                            }}
                          >
                            <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-primary px-1 py-0.5 text-[10px] text-primary-foreground">
                              {det.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {stage === "complete" && result && !imagePreview && (
                      <div className="scanline-animation absolute inset-0" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRemoveImage}>
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Remove
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <RotateCcw className="mr-1 h-3.5 w-3.5" />
                      Replace
                    </Button>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <Button
                className="w-full"
                disabled={!imageFile || isAnalyzing}
                onClick={() => runAnalysis()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ScanLine className="mr-2 h-4 w-4" />
                    Analyze Waste
                  </>
                )}
              </Button>

              {/* Progress */}
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={progressValue} />
                  <p className="text-center text-xs text-muted-foreground">
                    {PROGRESS_STAGES[progressIndex]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Try a Sample */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Try a sample</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {SAMPLE_CARDS.map((sample) => (
                  <button
                    key={sample.kind}
                    onClick={() => handleSampleClick(sample.kind)}
                    className="group relative overflow-hidden rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${sample.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <div className="relative flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br ${sample.gradient} text-white`}>
                        {sample.icon}
                      </div>
                      <span className="text-xs font-medium leading-tight">{sample.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-4">
          {stage === "complete" && result ? (
            <>
              {/* Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Detection Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Top KPIs */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <MetricCard
                      title="Category"
                      value={result.category}
                      icon={<Package className="h-4 w-4" />}
                    />
                    <MetricCard
                      title="Objects Detected"
                      value={result.detectedObjectCount}
                      icon={<ScanLine className="h-4 w-4" />}
                    />
                    <MetricCard
                      title="Est. Weight"
                      value={result.estimatedWeightKg}
                      unit="kg"
                      icon={<Layers className="h-4 w-4" />}
                    />
                  </div>

                  {/* Confidence */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Confidence</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(result.overallConfidence * 100)}% · {getConfidenceLabel(result.overallConfidence)}
                      </span>
                    </div>
                    <Progress value={Math.round(result.overallConfidence * 100)} />
                  </div>

                  {/* Risk + Meta */}
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={result.riskLevel} variant="risk" />
                    <span className="text-xs text-muted-foreground">
                      {result.processingTimeMs}ms · {result.model} · {result.modelVersion}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Simulated inference
                    </Badge>
                  </div>

                  {/* Low-confidence review banner */}
                  {result.overallConfidence < 0.6 && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-medium">Review Manually</p>
                        <p className="mt-0.5 text-xs text-amber-700">
                          Low-confidence classification. Verify the detected material before routing
                          any disposal or reporting actions.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Detection List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Detected Objects</h4>
                    <div className="space-y-1.5">
                      {result.detections.map((det) => (
                        <div
                          key={det.id}
                          className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{det.label}</span>
                            <StatusBadge
                              status={getSeverityForDetection(det.label)}
                              variant="severity"
                            />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{Math.round(det.confidence * 100)}%</span>
                            <span>{det.estimatedWeightKg} kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why This Result */}
                  <Dialog open={showWhyDialog} onOpenChange={setShowWhyDialog}>
                    <DialogTrigger
                      render={
                        <Button variant="outline" size="sm" className="gap-1.5" />
                      }
                    >
                      <Info className="h-3.5 w-3.5" />
                      Why this result?
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Evidence &amp; Explanation</DialogTitle>
                        <DialogDescription>
                          Signals used by the demo classifier to produce this result.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Evidence Signals</h4>
                        <ul className="space-y-1.5">
                          {result.evidence.map((e, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWhyDialog(false)}>
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Recommended Segregation */}
              {segregation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Recommended Segregation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <p className="mt-0.5 text-sm font-medium">{segregation.destination}</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Priority</p>
                        <p className="mt-0.5 text-sm font-medium">{segregation.priority}</p>
                      </div>
                      <div className="rounded-lg border p-3 sm:col-span-1">
                        <p className="text-xs text-muted-foreground">Handling</p>
                        <p className="mt-0.5 text-sm font-medium">{segregation.handling}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Manual Correction */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Manual Correction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Change classification" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory !== originalCategory && originalCategory && (
                    <p className="text-xs text-muted-foreground">
                      Original: {originalCategory} · Corrected: {selectedCategory}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Optional Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    Optional Location Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedRiver} onValueChange={(v) => { setSelectedRiver(v ?? ""); setSelectedZone(""); }}>
                    <SelectTrigger className="w-full">
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

                  {selectedRiver && (
                    <Select value={selectedZone} onValueChange={(v) => setSelectedZone(v ?? "")}>
                      <SelectTrigger className="w-full">
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
                  )}

                  {selectedZoneData && riverSummary && (
                    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                      <Badge variant="secondary" className="text-[10px]">
                        Prototype context
                      </Badge>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">WQI:</span>{" "}
                          <span className="font-medium">{selectedZoneData.waterQualityScore}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk:</span>{" "}
                          <span className="font-medium">{selectedZoneData.riskLevel}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Active Reports:</span>{" "}
                          <span className="font-medium">{riverSummary.activeReports}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pollution Level:</span>{" "}
                          <span className="font-medium">{selectedZoneData.pollutionLevel}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  render={
                    <Link
                      href={`/report-pollution?analysis=${result.id}${selectedRiver ? `&river=${selectedRiver}` : ""}${selectedZone ? `&zone=${selectedZone}` : ""}`}
                    />
                  }
                >
                  <FileText className="mr-1.5 h-4 w-4" />
                  Create Pollution Report
                </Button>
                <Button
                  variant="outline"
                  render={<Link href="/action-center" />}
                >
                  <Zap className="mr-1.5 h-4 w-4" />
                  Create Action
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    runAnalysis(
                      (sampleKind as "plastic" | "organic" | "mixed" | "industrial" | "unknown") ??
                        undefined
                    )
                  }
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  Retry analysis
                </Button>
              </div>
            </>
          ) : (
            <Card className="flex min-h-[400px] items-center justify-center">
              <EmptyState
                icon={<ScanLine className="h-6 w-6" />}
                title="No analysis yet"
                description="Upload an image or try a sample to see waste detection results."
              />
            </Card>
          )}
        </div>
      </div>

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {demoAnalysisHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">{entry.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()} · {Math.round(entry.confidence * 100)}% confidence
                    </p>
                  </div>
                </div>
                <StatusBadge status={entry.risk} variant="severity" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Transparency */}
      <Accordion>
        <AccordionItem value="transparency">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              AI Transparency Notice
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              Results shown in demonstration mode are generated from simulated inference and are not
              real environmental measurements. This prototype illustrates the intended workflow and
              should not be used for actual waste management decisions.
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
