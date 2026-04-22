import React from "react";

export default function Footer() {
  return (
    <footer className="w-full mt-auto py-12 px-6 border-t border-white/[0.03] bg-black/20 backdrop-blur-md text-center flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent no-print" />
      
      <div className="flex flex-col items-center gap-3 mb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="Image Armour Logo" className="w-10 h-10 object-contain rounded-xl drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
        <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-white/90">
          Image Armour
        </h2>
      </div>

      <p className="text-xs md:text-sm text-slate-400 font-light max-w-xl mx-auto mb-8 leading-relaxed">
        A Rule-Based Image Safety Analysis System for Detecting Suspicious Modifications
      </p>

      <div className="flex flex-col items-center gap-1">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          Researched and developed by
        </p>
        <p className="text-sm md:text-base font-medium text-white/80 tracking-wide mt-1">
          Ihsana S Ibrahim <span className="text-indigo-400/80 font-mono text-xs ml-2 px-2 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">24MCAR0144</span>
        </p>
      </div>
    </footer>
  );
}
