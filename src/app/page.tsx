"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload, AlertCircle, CheckCircle2, ShieldAlert,
  Code2, Download, FileText, Info, ShieldCheck, X,
  ChevronDown, ChevronUp, Eye, Lock, Cpu, Database, Printer
} from "lucide-react";

import { IndicatorCard } from "@/components/IndicatorCard";
import { HiddenDataViewer } from "@/components/HiddenDataViewer";
import { ScoreRing } from "@/components/ScoreRing";
import { ReportData } from "@/types";

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [showHexModal, setShowHexModal] = useState(false);
  const [maxSizeMB, setMaxSizeMB] = useState(4.5);

  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setMaxSizeMB(Infinity);
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errorMsg = rejection.errors.map((e: any) => {
        if (e.code === 'file-too-large') return `File is larger than ${maxSizeMB}MB limit`;
        return e.message;
      }).join(", ");
      setError(`Upload failed: ${errorMsg}`);
      return;
    }

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
      
      if (res.status === 413) {
        throw new Error(`Image is too large. ${maxSizeMB === Infinity ? 'The server rejected the payload size.' : 'Vercel limits uploads to 4.5MB.'}`);
      }
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Server returned an invalid response (Status ${res.status}). The file might be too large or the server encountered an error.`);
      }

      if (!res.ok || !data.success) throw new Error(data.error || "Analysis failed");
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [maxSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    maxSize: maxSizeMB === Infinity ? undefined : maxSizeMB * 1024 * 1024,
    multiple: false,
  });

  const classColors = {
    SAFE: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    SUSPICIOUS: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    UNSAFE: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-0 pb-24 px-4 md:px-8 relative z-10 selection:bg-indigo-500/30">
      <AnimatePresence mode="wait">
        {!report && !isAnalyzing && (
          <motion.div key="hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full text-center"
          >
            <div className="flex flex-col items-center w-full px-4 md:px-0">
              <p className="mb-8 text-xs font-medium tracking-[0.4em] uppercase text-indigo-400/60">
                Rule-Based Forensic Analysis Engine
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-8 leading-tight text-white/90">
                Is Your Image Safe? <span className="text-indigo-400/80 font-normal">Verify Before You Trust.</span>
              </h1>
              <p className="text-slate-400 mb-12 text-base md:text-lg max-w-3xl leading-relaxed font-light px-4">
                Analyze file signatures, pixel entropy, and EXIF metadata to detect appended payloads and simple LSB steganography.
              </p>

              {error && (
                <div className="mb-10 p-8 w-full max-w-xl glass border-red-500/20 rounded-[2rem] text-red-400 flex items-center gap-6 text-sm font-light shadow-2xl">
                  <ShieldAlert className="w-8 h-8 shrink-0 text-red-500/50" />
                  <p className="text-left leading-relaxed">{error}</p>
                </div>
              )}

              <div
                {...getRootProps()}
                className={`dropzone-area w-full max-w-4xl p-10 md:p-24 border border-dashed rounded-[3rem] cursor-pointer transition-all duration-700 flex flex-col items-center glass hover:shadow-[0_0_80px_rgba(99,102,241,0.15)] hover:border-white/20 hover:scale-[1.01]
                  ${isDragActive ? "border-indigo-500/50 bg-indigo-500/5 scale-[1.02] shadow-[0_0_100px_rgba(99,102,241,0.2)]" : "border-white/5"}`}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-10 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <CloudUpload className="w-10 h-10 text-white/40 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-xl md:text-2xl font-light mb-4 text-white/90">Drag & Drop your image here</h3>
                <p className="text-slate-500 text-sm md:text-base mb-12 font-light">
                  Supports JPG, PNG, WEBP · {maxSizeMB === Infinity ? "Unlimited file size" : `Max size ${maxSizeMB}MB`}
                </p>
                <button className="px-12 py-4 bg-white text-black rounded-full font-medium hover:bg-slate-200 transition-all shadow-xl active:scale-95 text-base">
                  Browse Files
                </button>
              </div>
            </div>

            {/* Professional Feature Section - Redesigned for Clarity & Luxury */}
            <div className="w-full mt-40 border-t border-white/[0.03] pt-32 pb-24 px-6 md:px-12">
              <div className="w-full">
                <div className="text-center mb-20">
                  <h2 className="text-sm font-bold tracking-[0.5em] uppercase text-indigo-500/60 mb-4">Core Capabilities</h2>
                  <p className="text-3xl font-light text-white/90 tracking-tight">Sophisticated Detection Suite</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                  {[
                    { 
                      id: "mime",
                      icon: <Lock className="w-8 h-8 text-indigo-400" />, 
                      label: "MIME Validation", 
                      desc: "Binary Analysis",
                      hoverText: "Verifying binary signatures to prevent malicious script execution disguised as standard image formats."
                    },
                    { 
                      id: "payload",
                      icon: <Eye className="w-8 h-8 text-purple-400" />, 
                      label: "Hidden Payloads", 
                      desc: "EOF Steganography",
                      hoverText: "Isolating anomalies beyond the image data stream to detect embedded malicious payloads."
                    },
                    { 
                      id: "exif",
                      icon: <Database className="w-8 h-8 text-pink-400" />, 
                      label: "EXIF & GPS", 
                      desc: "Privacy Audit",
                      hoverText: "Deep-layer metadata inspection to reveal hidden geolocation and device identification data."
                    },
                    { 
                      id: "entropy",
                      icon: <Cpu className="w-8 h-8 text-blue-400" />, 
                      label: "Entropy Scan", 
                      desc: "Math Profiling",
                      hoverText: "Statistical randomness analysis to identify encrypted channels smuggled within pixel structures."
                    },
                    { 
                      id: "hash",
                      icon: <Code2 className="w-8 h-8 text-emerald-400" />, 
                      label: "SHA-256 Hash", 
                      desc: "Cryptographic ID",
                      hoverText: "Generating unique binary fingerprints to instantly verify file integrity against global threat intelligence."
                    },
                  ].map((f) => (
                    <div 
                      key={f.id} 
                      onMouseEnter={() => setActiveTile(f.id)}
                      onMouseLeave={() => setActiveTile(null)}
                      className={`relative group h-80 rounded-[2.5rem] transition-all duration-700 cursor-default border border-white/[0.05] flex flex-col items-center justify-center p-8 overflow-hidden
                        ${activeTile === f.id ? "bg-white/[0.04] border-white/10 -translate-y-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)]" : "bg-white/[0.01] hover:bg-white/[0.02] translate-y-0"}`}
                    >
                      {/* Premium Glass Reflection */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      
                      {/* Gradient Ambient Light */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                      
                      {/* Default View */}
                      <div className={`flex flex-col items-center transition-all duration-700 ${activeTile === f.id ? "opacity-0 -translate-y-4 scale-90 blur-lg" : "opacity-100 translate-y-0 scale-100"}`}>
                        <div className="mb-8 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-inner group-hover:scale-110 group-hover:bg-white/[0.04] transition-all duration-500">
                          {f.icon}
                        </div>
                        <h4 className="text-lg font-medium text-white/90 tracking-tight">{f.label}</h4>
                        <p className="text-[9px] text-slate-500 mt-3 font-bold tracking-[0.2em] uppercase">{f.desc}</p>
                      </div>

                      {/* Hover Description - Professional Overlay */}
                      <div className={`absolute inset-0 p-10 flex flex-col items-center justify-center text-center transition-all duration-700 ${activeTile === f.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
                        <h4 className="text-base font-medium text-white mb-4">{f.label}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">
                          {f.hoverText}
                        </p>
                        <div className="mt-8 w-6 h-[1px] bg-indigo-500/30" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ANALYZING ── */}
        {isAnalyzing && (
          <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center w-full py-40"
          >
            <div className="relative w-28 h-28 mb-10">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              <ShieldCheck className="absolute inset-0 m-auto w-12 h-12 text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3 text-white">Running Forensic Analysis…</h2>
            <p className="text-[var(--color-brand-muted)] text-base">Deep-scanning pixel data, headers, and metadata</p>
          </motion.div>
        )}

        {/* ── REPORT ── */}
        {report && (
          <motion.div key="report" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-[var(--color-brand-border)] gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">Analysis Report</h1>
                <p className="text-[var(--color-brand-muted)] text-sm flex items-center gap-2 font-medium">
                  Scan ID: <span className="font-mono text-indigo-400">#{report.scanId}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-border)] inline-block" />
                  {new Date(report.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button
                onClick={() => { setReport(null); setPreviewUrl(null); }}
                className="no-print px-5 py-2.5 glass rounded-xl hover:bg-white/10 transition-colors text-sm font-bold text-white shrink-0"
              >
                Scan Another Image
              </button>
            </div>

            {/* Top grid - Bento Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 print-avoid-break">

              {/* Score + Verdict */}
              <div className="md:col-span-5 lg:col-span-4 glass rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                <ScoreRing score={report.riskScore} />
                <div className={`mt-8 px-6 py-2.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 border shadow-lg ${classColors[report.classification].bg} ${classColors[report.classification].text} ${classColors[report.classification].border}`}>
                  {report.classification === "SAFE" && <CheckCircle2 className="w-5 h-5" />}
                  {report.classification === "SUSPICIOUS" && <AlertCircle className="w-5 h-5" />}
                  {report.classification === "UNSAFE" && <ShieldAlert className="w-5 h-5" />}
                  {report.classification}
                </div>
                <p className="text-center text-xs text-slate-300 mt-5 leading-relaxed font-light">{report.classificationReason}</p>
              </div>

              {/* Image Preview + File Info */}
              <div className="md:col-span-7 lg:col-span-8 glass rounded-[2.5rem] p-6 md:p-8 flex flex-col-reverse lg:flex-row gap-6 lg:gap-8 items-center justify-between">
                <div className="w-full lg:w-1/2 flex flex-col gap-5">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4" /> Analyzed File Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {[
                      ["Filename", report.technicalData.filename],
                      ["Size", (report.technicalData.size / 1024).toFixed(1) + " KB"],
                      ["Dimensions", report.technicalData.dimensions],
                      ["MIME Type", report.technicalData.mimeType],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-2xl p-4 border border-white/5 shadow-inner">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] mb-1.5 font-bold">{k}</p>
                        <p className="font-mono text-white/90 truncate text-sm" title={v}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 aspect-video lg:aspect-square max-h-[280px] bg-black/40 rounded-[2rem] overflow-hidden border border-white/5 shadow-inner flex items-center justify-center relative group p-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  {previewUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={previewUrl} alt="Analyzed" className="w-full h-full object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-700" />
                  )}
                </div>
              </div>

              {/* Technical Data (spans full width) */}
              <div className="md:col-span-12 glass rounded-[2.5rem] p-6 md:p-8">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Code2 className="w-4 h-4" /> Technical Data
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    ["SHA-256 Hash", report.technicalData.fileHash.substring(0, 12) + "..." + report.technicalData.fileHash.slice(-8), report.technicalData.fileHash],
                    ["Magic Bytes", report.technicalData.magicBytes, undefined],
                    ["Pixel Entropy", report.technicalData.pixelEntropy, undefined],
                    ["Software Tag", report.technicalData.softwareTag, undefined],
                  ].map(([k, v, title]) => (
                    <div key={k as string} className="relative group">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] mb-2 font-bold pl-1">{k}</p>
                      <div className="font-mono text-sm bg-black/40 group-hover:bg-black/60 transition-colors px-5 py-4 rounded-2xl border border-white/5 truncate text-slate-200 shadow-inner" title={title as string | undefined}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hidden Data Sections */}
            {report.hiddenDataSections.length > 0 && (
              <div className="mb-8 print-page-break">
                <h2 className="text-xl md:text-2xl font-extrabold mb-5 flex items-center gap-3 text-red-400">
                  <Eye className="w-6 h-6" /> Hidden Data Exposed
                  <span className="text-xs bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full font-bold text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    {report.hiddenDataSections.length} anomaly{report.hiddenDataSections.length > 1 ? "s" : ""} detected
                  </span>
                </h2>
                <div className="flex flex-col gap-5">
                  {report.hiddenDataSections.map((s, i) => (
                    <HiddenDataViewer key={i} section={s} />
                  ))}
                </div>
              </div>
            )}

            {/* EXIF Details */}
            {Object.keys(report.exifDetails).length > 0 && (
              <div className="mb-8 glass rounded-[2.5rem] p-6 md:p-8 print-avoid-break">
                <h2 className="text-xl md:text-2xl font-extrabold mb-8 flex items-center gap-3 text-white">
                  <Database className="w-6 h-6 text-indigo-400" /> Embedded Metadata (EXIF)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(report.exifDetails).map(([k, v]) => (
                    <div key={k} className="bg-black/30 rounded-2xl p-5 border border-white/5 hover:bg-black/40 transition-colors shadow-inner group">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] mb-2 font-bold group-hover:text-indigo-400/80 transition-colors">{k}</p>
                      <p className="text-sm font-mono text-white/90 truncate" title={v}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Indicators */}
            <div className="mb-8 glass rounded-[2.5rem] p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-extrabold mb-8 flex items-center gap-3 text-white">
                <ShieldAlert className="w-6 h-6 text-indigo-400" /> Security Findings
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {report.indicators.map((ind) => (
                  <IndicatorCard key={ind.id} ind={ind} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 no-print mt-4">
              <button 
                onClick={() => setShowHexModal(true)}
                className="px-6 py-4 glass rounded-2xl hover:bg-white/10 transition-all text-sm font-bold flex items-center justify-center gap-2 active:scale-95"
              >
                <FileText className="w-4 h-4" /> View Full Hex Dump
              </button>
              <button 
                onClick={() => window.print()}
                className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Forensic Hex Dump Modal */}
      <AnimatePresence>
        {showHexModal && report && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHexModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl max-h-[85vh] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Forensic Hex Dump</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Raw Binary Analysis · First 4,096 Bytes</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHexModal(false)}
                  className="p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Hex Content */}
              <div className="flex-1 overflow-auto p-8 font-mono text-[10px] md:text-xs leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-4">Binary Data (HEX)</p>
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-slate-300 break-all whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
                      {report.technicalData.fullHexDump}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-4">Forensic Analysis Guidance</p>
                    <div className="space-y-4">
                      {[
                        { t: "Magic Bytes", d: "The first few bytes define the true file type, regardless of extension." },
                        { t: "Null Padding", d: "Large blocks of 00 often indicate uninitialized space or specific offsets." },
                        { t: "ASCII Strings", d: "Hidden text often appears as readable characters amongst binary noise." },
                        { t: "Entropy", d: "High visual variety in the hex patterns often indicates encryption." },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                          <p className="text-[10px] font-bold text-white mb-1 uppercase tracking-tight">{item.t}</p>
                          <p className="text-[11px] text-slate-500 font-light">{item.d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Source: {report.technicalData.filename}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowHexModal(false)}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
