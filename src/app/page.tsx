"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload, AlertCircle, CheckCircle2, ShieldAlert,
  Code2, Download, FileText, Info, ShieldCheck,
  ChevronDown, ChevronUp, Eye, Lock, Cpu, Database,
} from "lucide-react";

type Indicator = {
  id: string;
  name: string;
  status: "PASS" | "FAIL" | "INFO";
  riskImpact: number;
  plainEnglish: string;
  technical: string;
  whyItMatters: string;
};

type HiddenSection = {
  type: string;
  title: string;
  payloadType: string;
  sizeBytes: number;
  textPreview: string;
  hexDump: string;
  eofOffset: string;
};

type ReportData = {
  success: boolean;
  scanId: string;
  date: string;
  riskScore: number;
  classification: "SAFE" | "SUSPICIOUS" | "UNSAFE";
  classificationReason: string;
  indicators: Indicator[];
  hiddenDataSections: HiddenSection[];
  exifDetails: Record<string, string>;
  technicalData: {
    fileHash: string;
    pixelEntropy: string;
    softwareTag: string;
    dimensions: string;
    mimeType: string;
    magicBytes: string;
    size: number;
    filename: string;
  };
};

// ── Sub-Components ────────────────────────────────────────────────────────────

function StatusBadge({ status, impact }: { status: string; impact: number }) {
  if (status === "PASS") return (
    <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PASS</span>
  );
  if (status === "INFO") return (
    <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">INFO</span>
  );
  return (
    <span className="text-xs font-bold px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
      +{impact} RISK
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "PASS") return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
  if (status === "INFO") return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
  return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
}

function IndicatorCard({ ind }: { ind: Indicator }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden
      ${ind.status === "FAIL" ? "border-red-500/20 bg-red-500/5" :
        ind.status === "PASS" ? "border-emerald-500/15 bg-emerald-500/5" :
        "border-indigo-500/15 bg-indigo-500/5"}`}
    >
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <StatusIcon status={ind.status} />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-sm">{ind.name}</h4>
            <StatusBadge status={ind.status} impact={ind.riskImpact} />
          </div>
          <p className="text-sm text-[var(--color-brand-muted)]">{ind.plainEnglish}</p>
        </div>
        <button className="text-[var(--color-brand-muted)] shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 mx-4 pt-4 pb-4 flex flex-col gap-3">
              <div className="rounded-lg bg-black/30 p-3">
                <p className="text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wider mb-1">Technical Detail</p>
                <p className="text-xs font-mono text-slate-300">{ind.technical}</p>
              </div>
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">💡 Why This Matters</p>
                <p className="text-xs text-slate-300 leading-relaxed">{ind.whyItMatters}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HiddenDataViewer({ section }: { section: HiddenSection }) {
  const [view, setView] = useState<"text" | "hex">("text");
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-red-500/20">
        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
        <div className="flex-1">
          <h4 className="font-bold text-red-300">{section.title}</h4>
          <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
            {section.payloadType} · {section.sizeBytes.toLocaleString()} bytes · starts at EOF {section.eofOffset}
          </p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="rounded-lg bg-red-900/20 p-3 border border-red-500/10">
          <p className="text-xs font-bold text-red-300 uppercase mb-1">⚠️ What was found hidden inside:</p>
          <p className="text-xs text-slate-300 leading-relaxed">{section.payloadType}</p>
        </div>

        <div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setView("text")}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${view === "text" ? "bg-[var(--color-brand-primary)] text-white" : "bg-white/5 text-[var(--color-brand-muted)] hover:bg-white/10"}`}
            >Text View</button>
            <button
              onClick={() => setView("hex")}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${view === "hex" ? "bg-[var(--color-brand-primary)] text-white" : "bg-white/5 text-[var(--color-brand-muted)] hover:bg-white/10"}`}
            >Hex View</button>
          </div>
          <pre className="bg-black/50 rounded-lg p-3 text-xs font-mono text-red-200 overflow-x-auto whitespace-pre-wrap break-all max-h-48 border border-red-500/10 leading-relaxed">
            {view === "text" ? (section.textPreview || "(Binary data — no readable text)") : section.hexDump}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score < 10 ? "#10b981" : score < 40 ? "#f59e0b" : "#ef4444";
  const dash = 283;
  const offset = dash - (dash * Math.min(score, 100)) / 100;
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={dash} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{score}</span>
        <span className="text-[10px] text-[var(--color-brand-muted)] font-semibold tracking-widest mt-0.5">RISK SCORE</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setIsAnalyzing(true);
    setReport(null);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Analysis failed");
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const classColors = {
    SAFE: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    SUSPICIOUS: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    UNSAFE: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-12 pb-24">
      <AnimatePresence mode="wait">

        {/* ── HERO ── */}
        {!report && !isAnalyzing && (
          <motion.div key="hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full max-w-3xl text-center"
          >
            <div className="px-4 py-1.5 mb-6 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Rule-Based Forensic Analysis
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Is Your Image Safe?<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Verify Before You Trust.
              </span>
            </h1>
            <p className="text-[var(--color-brand-muted)] mb-14 text-lg max-w-xl leading-relaxed">
              Detect hidden threats, metadata anomalies, and structural modifications. Transparent, rule-based and instant.
            </p>

            {error && (
              <div className="mb-8 p-4 w-full max-w-xl bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div
              {...getRootProps()}
              className={`w-full max-w-xl p-14 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 flex flex-col items-center bg-[var(--color-brand-card)]
                ${isDragActive ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]" : "border-[var(--color-brand-border)] hover:border-indigo-500/40"}`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-5">
                <CloudUpload className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drag & Drop your image here</h3>
              <p className="text-[var(--color-brand-muted)] text-sm mb-6">Supports JPG, PNG, WEBP · Max size 10MB</p>
              <button className="px-7 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-colors text-sm">
                Browse Files
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {[
                { icon: <Lock className="w-3.5 h-3.5" />, label: "MIME Validation" },
                { icon: <Eye className="w-3.5 h-3.5" />, label: "Hidden Payload Detection" },
                { icon: <Database className="w-3.5 h-3.5" />, label: "EXIF & GPS Inspection" },
                { icon: <Cpu className="w-3.5 h-3.5" />, label: "Entropy Analysis" },
                { icon: <Code2 className="w-3.5 h-3.5" />, label: "SHA-256 Hash" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[var(--color-brand-muted)]">
                  {f.icon} {f.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── ANALYZING ── */}
        {isAnalyzing && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full py-36"
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-[var(--color-brand-border)] rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
              <ShieldCheck className="absolute inset-0 m-auto w-9 h-9 text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Running Forensic Analysis…</h2>
            <p className="text-[var(--color-brand-muted)] text-sm">Inspecting file headers, metadata, hidden data, and pixel entropy</p>
          </motion.div>
        )}

        {/* ── REPORT ── */}
        {report && (
          <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--color-brand-border)]">
              <div>
                <h1 className="text-3xl font-bold mb-1">Analysis Report</h1>
                <p className="text-[var(--color-brand-muted)] text-sm flex items-center gap-2">
                  Scan ID: <span className="font-mono text-indigo-400">#{report.scanId}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-brand-border)] inline-block" />
                  {new Date(report.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => { setReport(null); setPreviewUrl(null); }}
                className="px-4 py-2 border border-[var(--color-brand-border)] rounded-xl hover:bg-[var(--color-brand-card)] transition-colors text-sm"
              >
                Scan Another
              </button>
            </div>

            {/* Top grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

              {/* Score + Verdict */}
              <div className="bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-2xl p-6 flex flex-col items-center">
                <ScoreRing score={report.riskScore} />
                <div className={`mt-5 px-5 py-2 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 border ${classColors[report.classification].bg} ${classColors[report.classification].text} ${classColors[report.classification].border}`}>
                  {report.classification === "SAFE" && <CheckCircle2 className="w-4 h-4" />}
                  {report.classification === "SUSPICIOUS" && <AlertCircle className="w-4 h-4" />}
                  {report.classification === "UNSAFE" && <ShieldAlert className="w-4 h-4" />}
                  {report.classification}
                </div>
                <p className="text-center text-sm text-[var(--color-brand-muted)] mt-4 leading-relaxed">{report.classificationReason}</p>
              </div>

              {/* Image Preview + File Info */}
              <div className="bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-2xl p-5 flex flex-col gap-4">
                <p className="text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wider">Analyzed File</p>
                {previewUrl && (
                  <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Analyzed" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Filename", report.technicalData.filename],
                    ["Size", (report.technicalData.size / 1024).toFixed(1) + " KB"],
                    ["Dimensions", report.technicalData.dimensions],
                    ["MIME Type", report.technicalData.mimeType],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-black/20 rounded-lg p-2">
                      <p className="text-[var(--color-brand-muted)] mb-0.5">{k}</p>
                      <p className="font-mono text-white truncate" title={v}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Data */}
              <div className="bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-2xl p-5 flex flex-col gap-3">
                <p className="text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> Technical Data
                </p>
                {[
                  ["SHA-256 Hash", report.technicalData.fileHash.substring(0, 10) + "..." + report.technicalData.fileHash.slice(-6), report.technicalData.fileHash],
                  ["Magic Bytes", report.technicalData.magicBytes, undefined],
                  ["Pixel Entropy", report.technicalData.pixelEntropy, undefined],
                  ["Software Tag", report.technicalData.softwareTag, undefined],
                ].map(([k, v, title]) => (
                  <div key={k as string}>
                    <p className="text-xs text-[var(--color-brand-muted)] mb-1">{k}</p>
                    <p className="font-mono text-sm bg-black/30 px-3 py-2 rounded-lg border border-[var(--color-brand-border)] truncate" title={title as string | undefined}>
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Data Sections */}
            {report.hiddenDataSections.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
                  <Eye className="w-5 h-5" /> Hidden Data Exposed
                  <span className="text-xs bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full font-normal text-red-400">
                    {report.hiddenDataSections.length} section{report.hiddenDataSections.length > 1 ? "s" : ""} found
                  </span>
                </h2>
                <div className="flex flex-col gap-4">
                  {report.hiddenDataSections.map((s, i) => (
                    <HiddenDataViewer key={i} section={s} />
                  ))}
                </div>
              </div>
            )}

            {/* EXIF Details */}
            {Object.keys(report.exifDetails).length > 0 && (
              <div className="mb-6 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" /> Embedded Metadata (EXIF)
                  <span className="text-xs text-[var(--color-brand-muted)] font-normal">— Hidden inside the image file</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(report.exifDetails).map(([k, v]) => (
                    <div key={k} className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-[var(--color-brand-muted)] mb-1">{k}</p>
                      <p className="text-sm font-mono text-white truncate" title={v}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Indicators */}
            <div className="mb-6 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" /> Risk Indicators
                <span className="text-xs text-[var(--color-brand-muted)] font-normal">— click any item to expand</span>
              </h2>
              <div className="flex flex-col gap-3">
                {report.indicators.map((ind) => (
                  <IndicatorCard key={ind.id} ind={ind} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button className="px-5 py-2.5 border border-[var(--color-brand-border)] rounded-xl hover:bg-[var(--color-brand-card)] transition-colors text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> View Full Hex Dump
              </button>
              <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors text-sm font-semibold flex items-center gap-2">
                <Download className="w-4 h-4" /> Download Report
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
