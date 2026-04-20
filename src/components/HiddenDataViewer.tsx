"use client";

import { useState } from "react";
import { ShieldAlert, Eye, Info } from "lucide-react";
import { HiddenSection } from "@/types";

export function HiddenDataViewer({ section }: { section: HiddenSection }) {
  const [view, setView] = useState<"text" | "hex">("text");
  const isLSB = section.type === "lsb_steganography";

  return (
    <div className={`rounded-[2rem] border overflow-hidden glass transition-all duration-500
      ${isLSB ? "border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.05)]" : "border-red-500/20 shadow-[0_20px_50px_rgba(239,68,68,0.05)]"}`}>
      
      {/* Header */}
      <div className={`flex items-center gap-4 p-6 border-b ${isLSB ? "border-amber-500/10 bg-amber-500/5" : "border-red-500/10 bg-red-500/5"}`}>
        <div className={`p-3 rounded-2xl ${isLSB ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>
          <ShieldAlert className="w-6 h-6 shrink-0" />
        </div>
        <div className="flex-1">
          <h4 className={`text-lg font-medium tracking-tight ${isLSB ? "text-amber-200" : "text-red-200"}`}>{section.title}</h4>
          <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">
            {section.payloadType} · {section.sizeBytes.toLocaleString()} bytes
            {section.eofOffset !== "N/A (pixel-level)" && ` · Offset ${section.eofOffset}`}
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">

        {/* ── LSB: decoded message panel ── */}
        {isLSB && section.textPreview && (
          <div className="rounded-3xl border border-amber-500/20 bg-black/40 overflow-hidden shadow-inner">
            <div className="flex items-center gap-2 px-6 py-3 border-b border-amber-500/10 bg-amber-500/5">
              <Eye className="w-4 h-4 text-amber-400" />
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-[0.2em]">Decoded Payload</p>
            </div>
            <div className="p-6">
              <p className="text-xl md:text-2xl font-light text-white leading-relaxed break-words italic">
                &ldquo;{section.textPreview}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                  Successfully extracted from pixel LSBs
                </p>
              </div>
            </div>
          </div>
        )}

        {/* What was found */}
        <div className={`rounded-2xl p-4 border flex items-start gap-3 ${isLSB ? "bg-amber-500/5 border-amber-500/10" : "bg-red-500/5 border-red-500/10"}`}>
          <div className="mt-1">
            <Info className={`w-4 h-4 ${isLSB ? "text-amber-400" : "text-red-400"}`} />
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase mb-1 tracking-[0.1em] ${isLSB ? "text-amber-300" : "text-red-300"}`}>Anomaly Analysis</p>
            <p className="text-sm text-slate-300 leading-relaxed font-light">{section.payloadType}</p>
          </div>
        </div>

        {/* Text / Hex toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              {isLSB ? "Raw extraction" : "Data Stream"}
            </p>
            <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
              <button
                onClick={() => setView("text")}
                className={`px-4 py-1.5 text-[10px] rounded-lg font-bold uppercase tracking-wider transition-all duration-300 ${view === "text" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
              >Text</button>
              <button
                onClick={() => setView("hex")}
                className={`px-4 py-1.5 text-[10px] rounded-lg font-bold uppercase tracking-wider transition-all duration-300 ${view === "hex" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
              >Hex</button>
            </div>
          </div>
          <pre className={`rounded-2xl p-5 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-60 leading-relaxed border shadow-inner
            ${isLSB ? "bg-black/60 text-amber-200/80 border-amber-500/10" : "bg-black/60 text-red-200/80 border-red-500/10"}`}>
            {view === "text" ? (section.textPreview || "(Binary data — no readable text string)") : section.hexDump}
          </pre>
        </div>

      </div>
    </div>
  );
}
