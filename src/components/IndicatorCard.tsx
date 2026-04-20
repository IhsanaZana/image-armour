"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { StatusIcon } from "./StatusIcon";
import { StatusBadge } from "./StatusBadge";
import { Indicator } from "@/types";

export function IndicatorCard({ ind }: { ind: Indicator }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-3xl border transition-all duration-500 overflow-hidden glass
      ${ind.status === "FAIL" ? "border-red-500/20 shadow-[0_10px_40px_rgba(239,68,68,0.05)]" :
        ind.status === "PASS" ? "border-emerald-500/15 shadow-[0_10px_40px_rgba(16,185,129,0.05)]" :
        "border-indigo-500/15 shadow-[0_10px_40px_rgba(99,102,241,0.05)]"}`}
    >
      <div className="flex items-start gap-4 p-6 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="mt-1">
          <StatusIcon status={ind.status} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4 mb-2 flex-wrap">
            <h4 className="font-medium text-base text-white/90">{ind.name}</h4>
            <StatusBadge status={ind.status} impact={ind.riskImpact} />
          </div>
          <p className="text-sm text-slate-400 font-light leading-relaxed">{ind.plainEnglish}</p>
        </div>
        <button className="text-slate-500 hover:text-white transition-colors shrink-0 mt-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 mx-6 pt-6 pb-6 flex flex-col gap-4">
              <div className="rounded-2xl bg-black/40 p-5 border border-white/5">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">Technical Forensic Data</p>
                <p className="text-xs font-mono text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">{ind.technical}</p>
              </div>
              <div className="rounded-2xl bg-amber-500/5 border border-amber-500/10 p-5">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Info className="w-3 h-3" /> Security Impact
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-light">{ind.whyItMatters}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
