"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Fingerprint, Calculator, Ticket, FileCode2, ShieldAlert,
  ChevronRight, Zap, Image as ImageIcon, Eye, BookOpen,
  Layers, Code, Box, Database, Server, MapPin, Camera, Key, FileText, Binary, Folder, File, ArrowRight
} from "lucide-react";

export default function PlaybookPage() {
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    { id: "intro", title: "Welcome to Image Armour! 🏰" },
    { id: "tech-stack", title: "1. The Builder's Tools (Tech Stack) 🛠️" },
    { id: "architecture", title: "2. Two Worlds: Frontend & Backend 🌍" },
    { id: "folder-structure", title: "3. Map of the Castle (Folders) 🗺️" },
    { id: "flow", title: "4. The Grand Journey (How it Works) 🎢" },
    { id: "sharp", title: "5. The Magnifying Glass (sharp) 🔍" },
    { id: "file-type", title: "6. The Disguise Detector (file-type) 🕵️" },
    { id: "exif", title: "7. The GPS Tracker (exif-parser) 🛰️" },
    { id: "entropy", title: "8. The Chaos Meter (Entropy) 🌪️" },
    { id: "lsb", title: "9. The Secret Decoder (LSB) 🤫" },
    { id: "lsb-edge-cases", title: "10. The Smart Detective (LSB Edge Cases) 🧠" },
    { id: "extraction-strategies", title: "11. The 4 Master Keys (Extraction) 🗝️" },
    { id: "hash", title: "12. The Magic Fingerprint (SHA-256) ✋" },
    { id: "crypto", title: "13. The Math Wizard (crypto) 🧙‍♂️" },
    { id: "hexdump", title: "14. X-Ray Vision (Hex Dump) 🦴" },
    { id: "cheat-sheet", title: "15. The Master Cheat Sheet 📝" },
    { id: "all-edge-cases", title: "16. The 27 Master Defenses (All Edge Cases) 🛡️" }
  ];

  const nextChapter = () => {
    setActiveChapter((p) => Math.min(chapters.length - 1, p + 1));
  };
  const prevChapter = () => {
    setActiveChapter((p) => Math.max(0, p - 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextChapter();
      if (e.key === "ArrowLeft") prevChapter();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-pink-300 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b-4 border-sky-300 p-3 md:p-4 sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between shadow-sm gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 p-2 rounded-xl rotate-3 shadow-sm">
            <BookOpen className="text-white w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-sky-600 tracking-tight text-center">Image Armour Playbook</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveChapter(16)} 
            className="bg-rose-500 hover:bg-rose-600 text-white font-black px-4 py-2 rounded-xl shadow-md transition-transform hover:-translate-y-1 flex items-center gap-2"
          >
            <ShieldAlert size={18} /> Edgecases
          </button>
          <div className="text-xs md:text-sm font-bold bg-sky-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sky-700 flex items-center gap-2">
            <span>Chapter {activeChapter} of {chapters.length - 1}</span>
            <span className="hidden lg:inline text-sky-400 font-normal">| Use ← → keys</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 mt-4 md:mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChapter}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="bg-white rounded-3xl p-6 md:p-10 border-4 border-slate-200 shadow-xl w-full overflow-hidden"
          >
            <div className="mb-8 border-b-2 border-slate-100 pb-4">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                {chapters[activeChapter].title}
              </h2>
            </div>
            
            {activeChapter === 0 && <IntroSection onNext={nextChapter} />}
            {activeChapter === 1 && <TechStackSection />}
            {activeChapter === 2 && <ArchitectureSection />}
            {activeChapter === 3 && <FolderStructureSection />}
            {activeChapter === 4 && <FlowSection />}
            {activeChapter === 5 && <SharpSection />}
            {activeChapter === 6 && <FileTypeSection />}
            {activeChapter === 7 && <ExifSection />}
            {activeChapter === 8 && <EntropySection />}
            {activeChapter === 9 && <LsbSection />}
            {activeChapter === 10 && <LsbEdgeCasesSection />}
            {activeChapter === 11 && <ExtractionStrategiesSection />}
            {activeChapter === 12 && <HashSection />}
            {activeChapter === 13 && <CryptoSection />}
            {activeChapter === 14 && <HexDumpSection />}
            {activeChapter === 15 && <CheatSheetSection />}
            {activeChapter === 16 && <AllEdgeCasesSection />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
          <button
            onClick={prevChapter}
            disabled={activeChapter === 0}
            className="w-full sm:w-auto px-6 py-4 bg-white border-4 border-slate-200 rounded-2xl font-bold text-slate-500 disabled:opacity-50 hover:-translate-y-1 hover:border-slate-300 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <ChevronRight className="rotate-180 w-5 h-5" /> Back
          </button>
          
          <select 
            className="w-full sm:w-auto p-3 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-600 focus:outline-none focus:border-sky-500"
            value={activeChapter}
            onChange={(e) => setActiveChapter(Number(e.target.value))}
          >
            {chapters.map((c, i) => (
              <option key={c.id} value={i}>{c.title}</option>
            ))}
          </select>

          <button
            onClick={nextChapter}
            disabled={activeChapter === chapters.length - 1}
            className="w-full sm:w-auto px-8 py-4 bg-sky-500 border-4 border-sky-600 rounded-2xl font-extrabold text-white disabled:opacity-50 hover:-translate-y-1 hover:bg-sky-400 hover:shadow-lg transition-all shadow flex items-center justify-center gap-2"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}

// --- CHAPTER COMPONENTS ---

function IntroSection({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-10">
      <motion.div 
        animate={{ rotate: [0, -5, 5, -5, 5, 0], y: [0, -10, 0] }} 
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        className="text-7xl md:text-9xl mb-8 inline-block drop-shadow-xl"
      >
        🏰
      </motion.div>
      <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
        Welcome to the ultimate deep-dive! You are going to learn exactly how our project is built, 
        how the Next.js framework connects the frontend to the backend, and how our 5 magical detective modules catch hidden secrets!
      </p>
      <button 
        onClick={onNext}
        className="px-8 py-4 md:px-10 md:py-5 bg-emerald-500 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 rounded-2xl font-extrabold text-white text-xl md:text-2xl hover:bg-emerald-400 transition-all shadow-lg w-full sm:w-auto"
      >
        Let's Start the Adventure! 🚀
      </button>
    </div>
  );
}

function TechStackSection() {
  const stack = [
    { name: "Next.js", icon: <Layers size={40}/>, color: "bg-black text-white", desc: "The Castle. It's a 'Full Stack' framework, meaning it builds BOTH the User Interface (buttons) AND the Backend Server (APIs) in one single project." },
    { name: "TypeScript", icon: <Code size={40}/>, color: "bg-blue-600 text-white", desc: "The Spellchecker. It's just JavaScript, but it checks for silly mistakes before we run the code. If we try to pass a 'string' when it expects a 'number', it yells at us!" },
    { name: "Tailwind CSS", icon: <Zap size={40}/>, color: "bg-teal-500 text-white", desc: "The Paintbrush. Instead of writing separate CSS files, we just write classes like 'bg-red-500 rounded-xl' directly in our HTML/JSX to style things instantly." },
    { name: "pnpm", icon: <Box size={40}/>, color: "bg-amber-500 text-white", desc: "The Delivery Truck. It's like 'npm', but much faster. It installs all the packages (like sharp, crypto) that our project needs to run." }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {stack.map((tech, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl hover:border-sky-300 transition-colors shadow-sm"
        >
          <div className={`${tech.color} p-4 rounded-2xl shadow-inner flex-shrink-0`}>
            {tech.icon}
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">{tech.name}</h3>
            <p className="text-slate-600 font-medium text-sm leading-relaxed">{tech.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ArchitectureSection() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-lg md:text-xl text-slate-600 mb-8 text-center font-medium max-w-4xl">
        In older apps, the <strong>Frontend</strong> (React) and <strong>Backend</strong> (Node.js) were two separate folders running on two separate servers. <br/>
        In <strong>Next.js</strong>, they live together happily under one roof!
      </p>

      <div className="w-full max-w-4xl relative">
        {/* Connection Line */}
        <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-2 bg-slate-200 -z-10 rounded-full border-t border-b border-slate-300 overflow-hidden">
          <motion.div 
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-1/3 h-full bg-sky-400"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0">
          {/* Frontend */}
          <div className="bg-white border-4 border-indigo-200 rounded-3xl p-6 w-full md:w-5/12 shadow-xl relative z-10">
            <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-bold absolute -top-4 left-6 shadow">Client (Browser)</div>
            <h3 className="text-2xl font-black text-indigo-900 mb-4 flex items-center gap-2"><ImageIcon/> Frontend</h3>
            <ul className="space-y-3 text-sm font-medium text-indigo-800">
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-400"/> Where you click "Upload"</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-400"/> Made of React Components</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-400"/> Sends the image as a "FormData" POST request to the API.</li>
              <li className="flex items-center gap-2 mt-4"><FileText className="text-green-500"/> Waits to receive <strong className="bg-indigo-100 px-1 rounded">JSON Data</strong> to draw the fancy report on the screen.</li>
            </ul>
          </div>

          {/* JSON Bridge Mobile */}
          <div className="md:hidden flex flex-col items-center justify-center text-sky-500 font-bold py-4">
            <ArrowRight className="w-8 h-8 rotate-90" />
            <span>Sends Image POST Request</span>
            <ArrowRight className="w-8 h-8 -rotate-90 mt-2" />
            <span>Returns JSON Report</span>
          </div>

          {/* Backend */}
          <div className="bg-white border-4 border-emerald-200 rounded-3xl p-6 w-full md:w-5/12 shadow-xl relative z-10">
            <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold absolute -top-4 left-6 shadow">Server (Node.js API)</div>
            <h3 className="text-2xl font-black text-emerald-900 mb-4 flex items-center gap-2"><Server/> Backend</h3>
            <ul className="space-y-3 text-sm font-medium text-emerald-800">
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"/> Route Handler (`api/analyze`)</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"/> Runs the 5 Detective Modules</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"/> Runs `sharp` & `crypto`</li>
              <li className="flex items-center gap-2 mt-4"><Binary className="text-emerald-500"/> Packages all findings into a <strong className="bg-emerald-100 px-1 rounded">JSON Object</strong> and sends it back!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderStructureSection() {
  const [activeFolder, setActiveFolder] = useState("app");

  const folders = {
    "app": { title: "src/app/", desc: "The heart of Next.js frontend! Every folder here becomes a web page. `page.tsx` is the home page. `api/analyze/route.ts` is the secret Backend server endpoint!", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
    "components": { title: "src/components/", desc: "Reusable Lego blocks for the UI. Things like buttons, upload boxes, and the StatusBadge are kept here to keep the main code clean.", color: "text-purple-500", bg: "bg-purple-50 border-purple-200" },
    "services": { title: "src/services/modules/", desc: "The Backend Detectives! This is where all the heavy lifting happens. We have a separate file for LsbAnalyzer, ExifAnalyzer, etc.", color: "text-red-500", bg: "bg-red-50 border-red-200" },
    "public": { title: "public/", desc: "Static assets. Things like the logo images or fonts go here. The browser can download these directly.", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 bg-slate-800 text-slate-300 rounded-2xl p-4 font-mono text-sm shadow-xl overflow-x-auto">
        <div className="flex items-center gap-2 text-white mb-4"><Folder size={16} className="text-yellow-400" /> image-armour</div>
        <div className="ml-4 border-l border-slate-600 pl-4 space-y-2">
          
          <div className="cursor-pointer hover:text-white flex items-center gap-2" onClick={() => setActiveFolder("app")}>
            <Folder size={16} className={activeFolder === "app" ? "text-blue-400" : "text-slate-400"} /> src/app
          </div>
          <div className="ml-4 border-l border-slate-600 pl-4 text-xs opacity-70">
            <div className="flex items-center gap-2"><File size={12}/> page.tsx (Frontend)</div>
            <div className="flex items-center gap-2"><File size={12}/> api/analyze/route.ts (Backend)</div>
          </div>

          <div className="cursor-pointer hover:text-white flex items-center gap-2 mt-2" onClick={() => setActiveFolder("components")}>
            <Folder size={16} className={activeFolder === "components" ? "text-purple-400" : "text-slate-400"} /> src/components
          </div>
          
          <div className="cursor-pointer hover:text-white flex items-center gap-2 mt-2" onClick={() => setActiveFolder("services")}>
            <Folder size={16} className={activeFolder === "services" ? "text-red-400" : "text-slate-400"} /> src/services/modules
          </div>
          <div className="ml-4 border-l border-slate-600 pl-4 text-xs opacity-70">
            <div className="flex items-center gap-2"><File size={12}/> ExifAnalyzer.ts</div>
            <div className="flex items-center gap-2"><File size={12}/> LsbAnalyzer.ts</div>
          </div>

          <div className="cursor-pointer hover:text-white flex items-center gap-2 mt-2" onClick={() => setActiveFolder("public")}>
            <Folder size={16} className={activeFolder === "public" ? "text-emerald-400" : "text-slate-400"} /> public
          </div>

        </div>
      </div>
      <div className="w-full md:w-2/3">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeFolder}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className={`h-full border-4 rounded-3xl p-8 flex flex-col justify-center ${folders[activeFolder as keyof typeof folders].bg}`}
          >
            <h3 className={`text-3xl font-black mb-4 font-mono ${folders[activeFolder as keyof typeof folders].color}`}>
              {folders[activeFolder as keyof typeof folders].title}
            </h3>
            <p className="text-xl text-slate-700 font-medium leading-relaxed">
              {folders[activeFolder as keyof typeof folders].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FlowSection() {
  const steps = [
    { title: "User Uploads", desc: "React Frontend posts image to /api/analyze", icon: <ImageIcon/>, color: "bg-blue-500", role: "Frontend" },
    { title: "API Receives Buffer", desc: "Next.js Backend converts it to raw byte numbers", icon: <Server/>, color: "bg-emerald-500", role: "Backend" },
    { title: "Sharp Processes", desc: "Breaks image into RGB pixels", icon: <Search/>, color: "bg-purple-500", role: "Backend" },
    { title: "5 Modules Scan", desc: "Exif, LSB, Entropy, FileType, AppendedData", icon: <ShieldAlert/>, color: "bg-red-500", role: "Backend" },
    { title: "JSON Response", desc: "Creates JSON: { status: 'UNSAFE', score: 95 }", icon: <FileCode2/>, color: "bg-amber-500", role: "Backend" },
    { title: "UI Renders", desc: "Frontend reads JSON, shows red badging & charts!", icon: <Zap/>, color: "bg-sky-500", role: "Frontend" },
  ];

  return (
    <div>
      <div className="relative max-w-2xl mx-auto py-8">
        {/* Connecting Line */}
        <div className="absolute top-0 bottom-0 left-[2rem] sm:left-[3.5rem] w-2 bg-slate-200 z-0 rounded-full"></div>
        
        <div className="space-y-8 relative z-10">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 sm:gap-6"
            >
              <div className={`${step.color} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white flex-shrink-0 z-10`}>
                {React.cloneElement(step.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl flex-1 border-2 border-slate-100 shadow-md relative hover:shadow-lg transition-shadow">
                <span className={`absolute -top-3 right-4 text-xs font-bold px-3 py-1 rounded-full text-white ${step.role === 'Frontend' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                  {step.role}
                </span>
                <h4 className="font-black text-slate-800 text-lg sm:text-xl">{step.title}</h4>
                <p className="text-sm sm:text-base font-medium text-slate-500 mt-1">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SharpSection() {
  const [zoom, setZoom] = useState(false);
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-500 p-3 rounded-2xl text-white shadow-inner">
            <Search size={32} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">What is "sharp"?</h2>
        </div>
        <p className="text-lg text-slate-600 font-medium leading-relaxed mb-4 bg-purple-50 p-4 rounded-2xl border-2 border-purple-100">
          <strong>sharp</strong> is our magical magnifying glass. It opens an image and breaks it down into millions of tiny colored dots called <strong>pixels</strong>.
        </p>
        <p className="text-slate-600 mb-6 text-sm sm:text-base">
          Instead of seeing a motorcycle, <strong>sharp</strong> gives us a giant list of numbers for Red, Green, Blue, and Alpha (transparency): <br/>
          <code className="bg-slate-100 px-2 py-1 rounded font-mono text-sm text-pink-600 font-bold mt-2 inline-block break-all">
            [182, 45, 201, 255, 183, 44, ...]
          </code>
        </p>
        <div className="bg-yellow-100 p-4 rounded-xl border-2 border-yellow-300 text-yellow-800 font-bold text-sm">
          ⚠️ Note: sharp is the ONLY package that touches the image pixels! Not crypto, not SHA-256. Just sharp.
        </div>
      </div>
      <div className="flex-1 w-full bg-slate-50 rounded-3xl p-6 border-4 border-slate-200 flex flex-col items-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setZoom(!zoom)}>
        <p className="text-xs sm:text-sm font-bold text-purple-600 mb-4 uppercase tracking-widest flex items-center gap-2">
          <Zap size={16} /> Click picture to use Sharp!
        </p>
        <motion.div 
          className="relative w-full max-w-[250px] aspect-square bg-slate-200 rounded-2xl overflow-hidden border-4 border-white shadow-xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&q=80" 
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: zoom ? 0.2 : 1 }}
            alt="Motorcycle"
          />
          <AnimatePresence>
            {zoom && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-2"
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded flex items-center justify-center shadow-sm text-[8px] sm:text-[10px] font-mono font-bold text-white/90"
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, ${['#f87171', '#34d399', '#60a5fa', '#a78bfa'][i % 4]}, ${['#dc2626', '#059669', '#2563eb', '#7c3aed'][i % 4]})`
                    }}
                  >
                    R:{100+i*5}<br/>G:{40+i}<br/>B:200
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function FileTypeSection() {
  const [scanned, setScanned] = useState(false);
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="flex-1 w-full bg-slate-900 rounded-3xl p-6 md:p-8 text-center text-white relative overflow-hidden cursor-pointer" onClick={() => setScanned(!scanned)}>
        {!scanned ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10">
            <FileText size={80} className="mx-auto text-red-400 mb-4" />
            <h3 className="text-2xl font-mono font-bold text-red-400">invoice.pdf</h3>
            <p className="mt-4 text-slate-400 font-bold text-sm">Click to Scan with <code className="text-yellow-300">file-type</code></p>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-10">
            <ImageIcon size={80} className="mx-auto text-green-400 mb-4" />
            <h3 className="text-2xl font-mono font-bold line-through text-red-500 mb-2">invoice.pdf</h3>
            <h3 className="text-3xl font-mono font-bold text-green-400 animate-pulse">virus.jpg</h3>
            <div className="mt-4 bg-red-500 text-white font-bold px-4 py-2 rounded-full inline-block">MIME MISMATCH DETECTED!</div>
          </motion.div>
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-3xl font-black text-slate-800 mb-4">The Disguise Detector</h2>
        <p className="text-lg text-slate-600 mb-4 font-medium">
          Hackers often hide malicious images by renaming them. They take `virus.jpg` and rename it to `invoice.pdf`. 
        </p>
        <p className="text-lg text-slate-600 mb-6 font-medium">
          We use the <code className="bg-slate-200 text-slate-800 px-2 rounded font-bold">file-type</code> package. It doesn't look at the `.pdf` extension. It looks at the actual <strong>Magic Bytes</strong> inside the file to figure out its true identity!
        </p>
        <ul className="space-y-2 font-bold text-slate-700">
          <li>1. User uploads <span className="text-red-500">invoice.pdf</span></li>
          <li>2. <code className="text-blue-500">file-type</code> scans the raw bytes.</li>
          <li>3. Finds <code className="text-emerald-600">FF D8 FF E0</code> (JPEG Signature).</li>
          <li>4. Flagged as UNSAFE! 🚨</li>
        </ul>
      </div>
    </div>
  );
}

function ExifSection() {
  return (
    <div className="text-center">
      <div className="bg-sky-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-sky-600 mb-6 shadow-inner">
        <MapPin size={40} />
      </div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 tracking-tight">The GPS Tracker (exif-parser)</h2>
      <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
        When you take a picture with a smartphone, the camera invisibly attaches a receipt called <strong>EXIF Data</strong>. 
        It contains exactly where and when the photo was taken! Our <code className="text-sky-600 bg-sky-50 px-2 rounded">exif-parser</code> package extracts this invisible text.
      </p>

      <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 sm:p-8 flex flex-col md:flex-row gap-8 text-left shadow-lg">
        <div className="flex-1 relative rounded-2xl overflow-hidden border-2 border-slate-200">
          <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80" alt="London" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
            <span className="text-white font-bold text-sm sm:text-base flex items-center gap-2"><Camera size={18}/> Taken by iPhone 14 Pro</span>
          </div>
        </div>
        <div className="flex-1 bg-slate-900 rounded-2xl p-4 sm:p-6 text-green-400 font-mono text-sm sm:text-base overflow-x-auto shadow-inner">
          <p className="text-slate-400 mb-4">// Hidden JSON output found by exif-parser</p>
          <p>{"{"}</p>
          <p className="pl-4">"Make": <span className="text-yellow-300">"Apple"</span>,</p>
          <p className="pl-4">"Model": <span className="text-yellow-300">"iPhone 14 Pro"</span>,</p>
          <p className="pl-4">"Software": <span className="text-yellow-300">"Adobe Photoshop"</span> <span className="text-red-400 animate-pulse ml-2">← EDITED!</span>,</p>
          <p className="pl-4">"GPSLatitude": <span className="text-blue-300">51.5072</span>,</p>
          <p className="pl-4">"GPSLongitude": <span className="text-blue-300">-0.1276</span></p>
          <p>{"}"}</p>
        </div>
      </div>
    </div>
  );
}

function EntropySection() {
  const [isEncrypted, setIsEncrypted] = useState(false);
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="flex-1 order-2 md:order-1">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">The Chaos Meter (Entropy)</h2>
        <p className="text-lg text-slate-600 mb-4 font-medium">
          <strong>Entropy</strong> is a math word for "randomness". 
        </p>
        <p className="text-lg text-slate-600 mb-6 font-medium">
          Normal pictures (like a blue sky) have low entropy because many pixels are the same blue color. <br/><br/>
          <strong>Encrypted data</strong> (like a hidden zip file) looks like pure, chaotic TV static. The math formula outputs a score from 0 to 8. If the score is near 8.0, it's dangerously random!
        </p>
        <button 
          onClick={() => setIsEncrypted(!isEncrypted)}
          className={`px-6 py-3 rounded-xl font-bold text-white transition-colors w-full sm:w-auto shadow-lg ${isEncrypted ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'}`}
        >
          {isEncrypted ? "Show Normal Image" : "Inject Encrypted Virus! 🐛"}
        </button>
      </div>
      <div className="flex-1 w-full order-1 md:order-2">
        <div className="bg-slate-100 rounded-3xl p-6 border-4 border-slate-200 text-center shadow-inner">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 border-2 border-white shadow-lg">
            {!isEncrypted ? (
              <div className="w-full h-full bg-gradient-to-br from-sky-300 to-blue-500 flex items-center justify-center text-white/50 text-xl font-black">
                Smooth Sky
              </div>
            ) : (
              <div className="w-full h-full flex flex-wrap opacity-80" style={{ background: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}>
              </div>
            )}
          </div>
          <p className="text-lg font-bold text-slate-500 uppercase tracking-wider mb-2">Calculated Entropy Score:</p>
          {!isEncrypted ? (
            <p className="text-4xl font-black text-green-500">4.12 / 8.0 <span className="text-sm block mt-1">SAFE (Predictable)</span></p>
          ) : (
            <p className="text-4xl font-black text-red-500 animate-pulse">7.99 / 8.0 <span className="text-sm block mt-1 text-red-600">UNSAFE (Highly Chaotic!)</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

function LsbSection() {
  const [decoded, setDecoded] = useState(false);
  return (
    <div className="text-center">
      <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-6">The Secret Decoder (LSB)</h2>
      <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-medium">
        LSB stands for <strong>Least Significant Bit</strong>. Remember when <code className="text-purple-600 font-bold">sharp</code> gave us pixel numbers from 0 to 255? 
        Hackers change the very <em>last binary digit</em> of the Red color to hide text. The human eye cannot see the color difference!
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-4 border-red-200 rounded-3xl p-6 shadow-sm">
          <div className="w-16 h-16 bg-[#ff0000] rounded-xl mx-auto mb-4 border-2 border-red-300 shadow"></div>
          <p className="font-bold text-red-800 mb-2">Original Pixel (Red)</p>
          <p className="font-mono text-2xl text-red-600 mb-2">255</p>
          <p className="font-mono text-sm bg-white p-2 rounded border border-red-100 text-slate-600">Binary: 1111111<strong className="text-xl text-green-500 bg-green-100 px-1 rounded">1</strong></p>
        </div>
        
        <div className="bg-red-50 border-4 border-red-200 rounded-3xl p-6 shadow-sm relative">
          <div className="w-16 h-16 bg-[#fe0000] rounded-xl mx-auto mb-4 border-2 border-red-300 shadow"></div>
          <p className="font-bold text-red-800 mb-2">Hacked Pixel (Red)</p>
          <p className="font-mono text-2xl text-red-600 mb-2">254</p>
          <p className="font-mono text-sm bg-white p-2 rounded border border-red-100 text-slate-600">Binary: 1111111<strong className="text-xl text-red-500 bg-red-100 px-1 rounded">0</strong></p>
          
          <div className="absolute -top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full shadow-lg rotate-12">
            Looks EXACTLY the same!
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={() => setDecoded(true)}
          disabled={decoded}
          className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black shadow-lg hover:bg-slate-700 disabled:opacity-50 transition-all active:scale-95"
        >
          {decoded ? "Extracting Bits..." : "Extract All Last Bits! 🔎"}
        </button>
        
        <AnimatePresence>
          {decoded && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-green-100 border-4 border-green-500 p-6 rounded-3xl inline-block max-w-full overflow-hidden shadow-xl"
            >
              <p className="text-green-800 font-bold mb-2">Hidden Binary Assembled:</p>
              <p className="font-mono text-sm sm:text-base text-slate-600 break-all bg-white p-4 rounded-xl border border-green-200">
                01001000 01100101 01101100 01101100 01101111 <br/>
                <motion.span 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                  className="block mt-4 text-3xl sm:text-4xl font-black text-red-600"
                >
                  "Hello Zana!"
                </motion.span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HashSection() {
  const [text, setText] = useState("photo.jpg");

  // A fake hash generator for visual effect
  const generateFakeHash = (input: string) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) hash = (hash << 5) - hash + input.charCodeAt(i);
    return Math.abs(hash).toString(16).padEnd(64, 'a4b8c9d2e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0').substring(0, 64);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-pink-500 p-3 rounded-2xl text-white shadow-inner">
          <Fingerprint size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">The Fingerprint (Hash)</h2>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <p className="text-lg text-slate-600 mb-4 font-medium">
            A <strong>Hash</strong> is a unique ID for a file—like a human fingerprint. 
            If two files are <em>exactly</em> the same, their hash is identical.
          </p>
          <p className="text-lg text-slate-600 mb-6 font-medium">
            <strong>SHA-256</strong> is the mathematical formula used to make this fingerprint. It always creates a 64-character string.
          </p>
          <ul className="space-y-3 font-bold text-slate-700 bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
            <li className="flex items-center gap-3"><span className="text-green-500 text-2xl">✅</span> Same file = Same hash ALWAYS!</li>
            <li className="flex items-center gap-3"><span className="text-red-500 text-2xl">💥</span> Change 1 byte = Completely different hash!</li>
            <li className="flex items-center gap-3"><span className="text-red-500 text-2xl">❌</span> You cannot reverse a hash back to the file.</li>
          </ul>
        </div>

        <div className="bg-sky-50 rounded-3xl p-6 border-4 border-sky-100 shadow-sm">
          <p className="font-bold text-sky-800 mb-2 uppercase text-sm tracking-wider">Try it yourself!</p>
          <p className="text-sm text-sky-600 mb-4">Type to change the file. Watch the fingerprint change!</p>
          
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xl p-4 rounded-xl border-2 border-sky-200 mb-6 font-mono focus:outline-none focus:border-sky-500 transition-colors shadow-inner"
            placeholder="Type something..."
          />
          
          <p className="font-bold text-slate-400 mb-2 text-sm uppercase">SHA-256 Fingerprint:</p>
          <motion.div 
            key={text}
            initial={{ scale: 1.05, backgroundColor: "#fdf2f8" }}
            animate={{ scale: 1, backgroundColor: "#ffffff" }}
            className="p-4 bg-white rounded-xl border-2 border-slate-200 font-mono text-xs sm:text-sm break-all text-pink-600 font-bold shadow-sm"
          >
            {text ? generateFakeHash(text) : "..."}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function CryptoSection() {
  return (
    <div className="text-center">
      <motion.div 
        animate={{ y: [-5, 5, -5] }} 
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-indigo-500 w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200 rotate-12"
      >
        <Calculator size={40} />
      </motion.div>
      <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">The Math Wizard: crypto</h2>
      <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto font-medium">
        <code>crypto</code> is a built-in Node.js toolbox. You don't install it; it comes for free! It only does <strong>two small math jobs</strong> in our project:
      </p>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
        <div className="bg-white p-6 rounded-3xl border-4 border-indigo-100 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div className="absolute top-0 right-0 bg-indigo-100 px-4 py-1 rounded-bl-xl font-bold text-indigo-800 text-sm">Job 1</div>
          <h3 className="text-xl font-black text-slate-800 mb-2 mt-4">Calculate the Hash</h3>
          <p className="text-slate-600 text-sm mb-4">Feed it bytes, it returns the SHA-256 fingerprint.</p>
          <code className="block bg-slate-800 text-green-400 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto shadow-inner">
            crypto.createHash("sha256")<br/>
            .update(buffer)<br/>
            .digest("hex")
          </code>
        </div>
        <div className="bg-white p-6 rounded-3xl border-4 border-teal-100 shadow-sm relative overflow-hidden group hover:border-teal-300 transition-colors">
          <div className="absolute top-0 right-0 bg-teal-100 px-4 py-1 rounded-bl-xl font-bold text-teal-800 text-sm">Job 2</div>
          <h3 className="text-xl font-black text-slate-800 mb-2 mt-4">Generate Scan ID</h3>
          <p className="text-slate-600 text-sm mb-4">Creates random characters for the report ticket.</p>
          <code className="block bg-slate-800 text-green-400 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto shadow-inner">
            crypto.randomBytes(4)<br/>
            .toString("hex")<br/>
            .toUpperCase()
          </code>
        </div>
      </div>
    </div>
  );
}

function HexDumpSection() {
  const [showHex, setShowHex] = useState(false);
  
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="flex-1 order-2 md:order-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-inner">
            <Eye size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">X-Ray Vision (Hex Dump)</h2>
        </div>
        <p className="text-lg text-slate-600 mb-4 font-medium">
          Every file on your computer is just numbers (0-255). We show these as <strong>Hexadecimal</strong> because it's shorter. 
        </p>
        <p className="text-slate-600 mb-6 font-medium">
          A JPEG always starts with magical bytes: <code className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">FF D8 FF E0</code>. 
          The hex dump is like an X-ray. It doesn't <em>scan</em> anything, it just lets detectives manually look for hidden text after the image ends!
        </p>
        <button 
          onClick={() => setShowHex(!showHex)}
          className="w-full sm:w-auto px-6 py-4 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors shadow-lg"
        >
          {showHex ? "Turn Off X-Ray" : "Turn On X-Ray Vision ☠️"}
        </button>
      </div>

      <div className="flex-1 w-full order-1 md:order-2 bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800 flex items-center px-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <p className="ml-4 text-xs font-mono text-slate-400">photo.jpg</p>
        </div>
        
        <div className="mt-6 h-48 md:h-64 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!showHex ? (
              <motion.div 
                key="img"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700"
              >
                <ImageIcon size={64} className="text-slate-500" />
              </motion.div>
            ) : (
              <motion.div 
                key="hex"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full h-full bg-black rounded-xl p-3 sm:p-4 font-mono text-[8px] sm:text-[10px] md:text-xs text-green-400 leading-relaxed overflow-y-auto"
              >
                <span className="text-yellow-300 font-bold">FF D8 FF E0</span> 00 10 4A 46 49 46 00 01 01 01 00 60<br/>
                00 60 00 00 FF DB 00 43 00 03 02 02 03 02 02 03<br/>
                03 03 03 04 03 03 04 05 08 05 05 04 04 05 0A 07<br/>
                07 06 08 0C 0A 0C 0C 0B 0A 0B 0B 0D 0E 12 10 0D<br/>
                ...<br/>
                <span className="text-red-400 font-bold mt-2 block break-all">53 74 65 67 20 50 61 79 6C 6F 61 64 21</span>
                <span className="text-slate-500">// Wait, that spells "Steg Payload!"</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function CheatSheetSection() {
  const data = [
    { q: "Tech Stack", a: "Next.js, TypeScript, Tailwind", bg: "bg-blue-100 text-blue-800" },
    { q: "JSON", a: "How Backend talks to Frontend", bg: "bg-sky-100 text-sky-800" },
    { q: "Who converts image to RGB?", a: "sharp", bg: "bg-purple-100 text-purple-800" },
    { q: "Who calculates the hash?", a: "crypto (SHA-256)", bg: "bg-indigo-100 text-indigo-800" },
    { q: "Who finds hidden LSB messages?", a: "LsbAnalyzer module", bg: "bg-red-100 text-red-800" },
    { q: "Who finds fake extensions?", a: "file-type package", bg: "bg-emerald-100 text-emerald-800" },
    { q: "Who generates the Scan ID?", a: "crypto.randomBytes()", bg: "bg-amber-100 text-amber-800" },
    { q: "Who extracts GPS data?", a: "exif-parser", bg: "bg-pink-100 text-pink-800" },
  ];

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        {data.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            key={i} className={`p-4 sm:p-6 rounded-2xl border-2 border-transparent hover:border-slate-300 transition-all ${item.bg} bg-opacity-50`}
          >
            <p className="text-xs sm:text-sm uppercase tracking-wider mb-2 opacity-80 font-bold">{item.q}</p>
            <p className="text-lg sm:text-2xl font-black leading-tight">{item.a}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 text-center bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-8 rounded-3xl border-4 border-emerald-200 font-black text-2xl sm:text-3xl shadow-xl hover:-translate-y-2 transition-transform cursor-pointer">
        You are 100% ready to rock the presentation! 🎉
      </div>
    </div>
  );
}

function LsbEdgeCasesSection() {
  const [scanTarget, setScanTarget] = useState<"bricks" | "glass">("bricks");
  const [libraryBooks, setLibraryBooks] = useState(2);
  const [monkeyText, setMonkeyText] = useState("");

  const typeRandom = () => {
    const noise = ["XQ ZZZ Q", "AAA BBB", "H7L0 Z!N@", "Hello Zana!"][Math.floor(Math.random() * 4)];
    setMonkeyText(noise);
  };

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-6 text-center">The Smart Detective 🧠</h2>
      <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto font-medium text-center">
        Our <code className="bg-slate-200 px-2 rounded text-indigo-700">LsbAnalyzer</code> uses real-world logic to prevent crashes and false alarms. Let's look at the analogies!
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 1. Alpha Channel */}
        <div className="bg-indigo-50 border-4 border-indigo-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="bg-indigo-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow">
            <Eye size={24} />
          </div>
          <h3 className="text-xl font-black text-indigo-900 mb-2">1. The Invisible Glass</h3>
          <p className="text-sm text-indigo-800 font-medium leading-relaxed mb-4">
            If someone hides a secret letter in a wall (RGB pixels), they won't hide it in a completely see-through glass window (Alpha Transparency). Scanning the glass gives us nothing but static!
          </p>
          <div className="mt-auto bg-white p-4 rounded-2xl border-2 border-indigo-100 text-center">
            <div className="flex justify-center gap-2 mb-2">
              <button onClick={() => setScanTarget("bricks")} className={`px-3 py-1 rounded font-bold text-xs ${scanTarget === 'bricks' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Scan Bricks</button>
              <button onClick={() => setScanTarget("glass")} className={`px-3 py-1 rounded font-bold text-xs ${scanTarget === 'glass' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Scan Glass</button>
            </div>
            {scanTarget === "bricks" ? (
              <p className="text-green-600 font-bold text-sm">✅ Found mixed data!</p>
            ) : (
              <p className="text-red-500 font-bold text-sm">❌ False alarm (All 1111s!)</p>
            )}
          </div>
        </div>

        {/* 2. Memory Cap */}
        <div className="bg-rose-50 border-4 border-rose-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="bg-rose-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow">
            <Database size={24} />
          </div>
          <h3 className="text-xl font-black text-rose-900 mb-2">2. The Tired Librarian</h3>
          <p className="text-sm text-rose-800 font-medium leading-relaxed mb-4">
            If a hacker uploads a 50 Megapixel RAW photo, it's like dropping 50 million books on a single librarian. To stop the server from crashing, the librarian stops reading after 2 Megabytes.
          </p>
          <div className="mt-auto bg-white p-4 rounded-2xl border-2 border-rose-100 text-center">
            <p className="font-bold text-rose-900 mb-2 text-sm">{libraryBooks} MB to read</p>
            <input type="range" min="1" max="50" value={libraryBooks} onChange={(e) => setLibraryBooks(Number(e.target.value))} className="w-full mb-2 accent-rose-500" />
            {libraryBooks <= 2 ? (
              <p className="text-green-600 font-bold text-sm">😎 Librarian is happy!</p>
            ) : (
              <p className="text-red-500 font-bold text-sm animate-pulse">🥵 Server Crashing!</p>
            )}
          </div>
        </div>

        {/* 3. NLP Filter */}
        <div className="bg-teal-50 border-4 border-teal-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="bg-teal-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow">
            <ShieldAlert size={24} />
          </div>
          <h3 className="text-xl font-black text-teal-900 mb-2">3. The Monkey Typist</h3>
          <p className="text-sm text-teal-800 font-medium leading-relaxed mb-4">
            If a monkey hits a keyboard randomly, it might type "AAA XYY". Our NLP filter checks for vowels and "Shannon Entropy" to prove it's a real human sentence, rejecting the monkey noise!
          </p>
          <div className="mt-auto bg-white p-4 rounded-2xl border-2 border-teal-100 text-center">
            <button onClick={typeRandom} className="bg-teal-500 text-white font-bold px-3 py-1 rounded text-xs mb-2 hover:bg-teal-600">Monkey Type!</button>
            <div className="h-12 flex items-center justify-center bg-slate-100 rounded font-mono text-sm font-bold border border-slate-200">
              {monkeyText === "" ? "..." : monkeyText}
            </div>
            {monkeyText && (
              <p className={`mt-2 text-xs font-bold ${monkeyText === "Hello Zana!" ? "text-green-600" : "text-red-500"}`}>
                {monkeyText === "Hello Zana!" ? "✅ Valid Human Text" : "❌ Rejected Noise"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExtractionStrategiesSection() {
  const keys = [
    { name: '1. The Secret Handshake', desc: 'Magic Bytes (0x53 74 65 67). A spy walks up and does a very specific secret handshake. We instantly know they used the "Devglan" steganography tool.', icon: <Key/>, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { name: '2. The Backpack Tag', desc: 'Length Prefixing. A messenger hands us a backpack with a tag that says "Contains exactly 42 letters". We don\'t have to guess; we just read 42 letters and stop.', icon: <Box/>, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { name: '3. The Stop Sign (0x00)', desc: 'Null-Terminated. We are driving down a road of text reading "H-e-l-l-o-Z-a-n-a". Suddenly we hit a giant 0x00 Stop Sign byte. That means the message is over!', icon: <MapPin/>, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { name: '4. The Brute Force Sieve', desc: 'Regex Fallback. We pour a giant bucket of binary dirt through a sieve. All the dirt falls through, but the shiny gold nuggets (human words) get caught.', icon: <Search/>, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' }
  ];

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-6 text-center">The 4 Extraction Master Keys 🗝️</h2>
      <p className="text-lg text-slate-600 mb-10 max-w-3xl mx-auto font-medium text-center">
        Once we pull the binary bits out of the pixels, it just looks like endless 1s and 0s. 
        How do we know where the secret message starts and ends? We use these 4 real-world strategies!
      </p>

      <div className="space-y-4 max-w-4xl mx-auto">
        {keys.map((key, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            key={i} className={`p-4 sm:p-6 rounded-2xl border-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm ${key.color}`}
          >
            <div className="bg-white p-3 sm:p-4 rounded-full shadow flex-shrink-0">
              {React.cloneElement(key.icon as React.ReactElement<any>, { size: 32 })}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black mb-1">{key.name}</h3>
              <p className="font-medium text-sm sm:text-base opacity-90">{key.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AllEdgeCasesSection() {
  const [activeModule, setActiveModule] = useState(0);
  const [demoState, setDemoState] = useState<any>({});

  const triggerDemo = (modKey: string | number, action: string) => {
    setDemoState({ ...demoState, [modKey]: action });
    setTimeout(() => {
      setDemoState((prev: any) => ({ ...prev, [modKey]: action + "_done" }));
    }, 800);
  };

  const modules = [
    {
      name: "MimeAnalyzer",
      icon: "🕵️",
      package: "file-type",
      count: 3,
      desc: "Checks the binary magic bytes instead of the file extension.",
      demo: {
        title: "The Spy Mismatch Demo",
        desc: "A hacker renames a virus.exe to cute_cat.jpg. How do we catch it?",
        button: "Simulate Upload",
        action: "upload",
        render: (state: string) => (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-sm font-mono mt-2">
            {!state && <div className="text-slate-500">Waiting for file upload...</div>}
            {state === "upload" && <div className="text-sky-400 animate-pulse">Running file-type scanner...</div>}
            {state === "upload_done" && (
              <div className="text-rose-400">
                <p>➔ Extension: <span className="text-white">.jpg</span></p>
                <p>➔ Magic Bytes: <span className="text-white">4D 5A (MZ)</span></p>
                <p className="font-bold mt-2">❌ FAIL: file-type detected this is actually an Executable (.exe)!</p>
              </div>
            )}
          </div>
        )
      },
      cases: [
        { title: "1. The Spy Mismatch", text: "If a hacker renames 'virus.exe' to 'invoice.jpg', we catch it by reading the internal magic bytes instead of trusting the file extension." },
        { title: "2. The Safe Twins", text: "We safely allow '.jpg' and '.jpeg' to be treated as identical twins without throwing false alarms." },
        { title: "3. The Unknown Blob", text: "If a completely unrecognised binary blob is uploaded, it handles it gracefully instead of crashing the parser." }
      ]
    },
    {
      name: "AppendedDataAnalyzer",
      icon: "📦",
      package: "Native Node.js Buffer",
      count: 3,
      desc: "Hunts for malicious scripts smuggled behind the image.",
      demo: {
        title: "The Threat Scanner Demo",
        desc: "Scan the binary Buffer for the JPEG End-Of-File (EOF) marker 'FF D9'.",
        button: "Scan Buffer",
        action: "scan",
        render: (state: string) => (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-sm font-mono mt-2">
            {!state && <div className="text-slate-500">Buffer: [FF D8 ... FF D9]</div>}
            {state === "scan" && <div className="text-sky-400 animate-pulse">Scanning past FF D9...</div>}
            {state === "scan_done" && (
              <div className="text-amber-400">
                <p>➔ EOF found at offset: <span className="text-white">0x2A4F</span></p>
                <p>➔ Extra bytes found: <span className="text-white">124 bytes</span></p>
                <p>➔ Content: <span className="text-rose-400">#!/bin/bash curl -s http...</span></p>
                <p className="font-bold mt-2 text-rose-500">⚠️ ALERT: Linux Shell Script Appended!</p>
              </div>
            )}
          </div>
        )
      },
      cases: [
        { title: "1. The Format Rule", text: "Only scans JPEGs, because PNGs and WebPs handle End-Of-File (EOF) markers differently." },
        { title: "2. The Harmless Backpack", text: "Safely ignores tiny data blobs (≤ 50 bytes) because some normal cameras add harmless padding." },
        { title: "3. The Threat Scanner", text: "Automatically fingerprints WHAT the appended data is (Linux Shell scripts, Python, Base64, ZIP) instead of just saying 'Unknown Data'." }
      ]
    },
    {
      name: "EntropyAnalyzer",
      icon: "🌪️",
      package: "sharp + Custom Math",
      count: 4,
      desc: "Calculates mathematical randomness to find encrypted Zip files.",
      demo: {
        title: "The Static Radar Demo",
        desc: "Analyze pixel randomness. Encrypted files look like perfect white noise.",
        button: "Calculate Shannon Entropy",
        action: "math",
        render: (state: string) => (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-sm font-mono mt-2">
            {!state && <div className="text-slate-500">Waiting to process pixels...</div>}
            {state === "math" && <div className="text-sky-400 animate-pulse">sharp resizing to 256x256... calculating logs...</div>}
            {state === "math_done" && (
              <div className="text-white">
                <p>➔ Pixel Array Size: 65,536</p>
                <p>➔ Entropy Formula: <span className="text-emerald-400">-Σ(p * log2(p))</span></p>
                <p className="font-bold mt-2 text-rose-500 text-lg">Result: 7.98 bits/pixel</p>
                <p className="text-rose-400">⚠️ EXTREME ENTROPY: This is an encrypted AES payload!</p>
              </div>
            )}
          </div>
        )
      },
      cases: [
        { title: "1. The Shrink Ray", text: "Resizes massive 50MP images to 256x256 using sharp before doing math, so the server CPU doesn't freeze." },
        { title: "2. The Blank Canvas (< 1.0)", text: "Identifies completely blank test images and flags them as 'Very Low Complexity'." },
        { title: "3. The Static Radar (> 7.95)", text: "Identifies perfectly random static, which is a massive red flag for AES-encrypted payload blobs." },
        { title: "4. The Broken Glass", text: "If the hacker destroyed the image headers and 'sharp' completely fails to open it, we catch the crash gracefully and flag it as a 'sharp-fail'." }
      ]
    },
    {
      name: "ExifAnalyzer",
      icon: "🛰️",
      package: "exif-parser",
      count: 4,
      desc: "Extracts invisible metadata embedded inside the photo.",
      demo: {
        title: "The Privacy Alarm Demo",
        desc: "Extract raw GPS coordinates hidden inside the JFIF segment.",
        button: "Run exif-parser",
        action: "parse",
        render: (state: string) => (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-sm font-mono mt-2">
            {!state && <div className="text-slate-500">Ready to parse metadata block...</div>}
            {state === "parse" && <div className="text-sky-400 animate-pulse">Reading EXIF APP1 tags...</div>}
            {state === "parse_done" && (
              <div className="text-sky-300">
                <p>➔ Make: Apple</p>
                <p>➔ Model: iPhone 14 Pro</p>
                <p className="text-rose-400 mt-2">➔ GPSLatitude: 40.7128° N</p>
                <p className="text-rose-400">➔ GPSLongitude: -74.0060° W</p>
                <p className="font-bold mt-2 text-rose-500">⚠️ PRIVACY FAIL: Exact location exposed!</p>
              </div>
            )}
          </div>
        )
      },
      cases: [
        { title: "1. The Social Media Ghost", text: "Gracefully handles files with ZERO metadata (common when downloading from WhatsApp, which strips metadata)." },
        { title: "2. The Privacy Alarm", text: "Specifically extracts GPS Latitude/Longitude and triggers a massive privacy fail warning." },
        { title: "3. The Hex Editor Catch", text: "If the metadata area is broken/corrupted, it flags it as 'exif-corrupt', meaning a human manually tampered with it." },
        { title: "4. The Photoshop Radar", text: "Hunts the 'Software' tag for professional suites (Photoshop, Canva, Gimp) to prove the image is not a raw camera photo." }
      ]
    },
    {
      name: "LsbAnalyzer",
      icon: "🧠",
      package: "sharp + Native Buffers + Regex",
      count: 13,
      desc: "Extracts secret text hidden directly inside the pixel colors.",
      demo: {
        title: "The NLP Monkey Filter Demo",
        desc: "Extracts bits using sharp, then uses Natural Language Processing to reject static.",
        button: "Extract & Filter Bits",
        action: "lsb",
        render: (state: string) => (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-sm font-mono mt-2">
            {!state && <div className="text-slate-500">Pixels loaded via sharp...</div>}
            {state === "lsb" && <div className="text-sky-400 animate-pulse">Skipping Alpha Channel... Extracting RGB LSBs...</div>}
            {state === "lsb_done" && (
              <div className="text-amber-400">
                <p>➔ Extracted binary: 01001000 01100101...</p>
                <p>➔ Decoded String 1: <span className="text-slate-500">"XQ ZZZ Q"</span> <span className="text-red-500">➔ Rejected (0 vowels)</span></p>
                <p>➔ Decoded String 2: <span className="text-emerald-400">"Hello Zana!"</span> <span className="text-emerald-500">➔ ACCEPTED (Vowels + High Entropy)</span></p>
                <p className="font-bold mt-2 text-emerald-500">✅ STEGO FOUND: Payload extracted safely!</p>
              </div>
            )}
          </div>
        )
      },
      cases: [
        { 
          title: "1. The Duplicate Guard", text: "Prevents re-running the same scan to avoid printing duplicate warnings on the report.",
          action: "c1", button: "Run Twice", 
          render: (s:string) => !s ? null : s==="c1" ? <div className="text-sky-400 animate-pulse mt-2">Running scan...</div> : <div className="text-amber-400 mt-2">➔ Run 1: Scanned!<br/>➔ Run 2: Blocked! (Duplicate Guard Active)</div>
        },
        { 
          title: "2. The Tiny Reject", text: "Ignores images too small (< 256 pixels) because they physically can't hold a payload.",
          action: "c2", button: "Upload 16x16 Image", 
          render: (s:string) => !s ? null : s==="c2" ? <div className="text-sky-400 animate-pulse mt-2">Counting subpixels...</div> : <div className="text-emerald-400 mt-2">➔ Found 120 pixels.<br/>➔ Minimum required: 256.<br/><span className="text-rose-400">❌ Rejected: Too small!</span></div>
        },
        { 
          title: "3. The 2MB Hard Cap", text: "Stops reading after 2MB to prevent server Out-Of-Memory (OOM) crashes on huge photos.",
          action: "c3", button: "Upload 50MP RAW", 
          render: (s:string) => !s ? null : s==="c3" ? <div className="text-sky-400 animate-pulse mt-2">Allocating memory...</div> : <div className="text-amber-400 mt-2">➔ Image Size: 50MP.<br/>➔ Buffer capped at exactly 2,097,152 bytes.<br/><span className="text-emerald-400">✅ Server Saved!</span></div>
        },
        { 
          title: "4. The 4-Stream Cascade", text: "Reads MSB/LSB bits simultaneously across channels to catch different hacker tool behaviors.",
          action: "c4", button: "Test Hacker Tools", 
          render: (s:string) => !s ? null : s==="c4" ? <div className="text-sky-400 animate-pulse mt-2">Checking 4 streams...</div> : <div className="text-amber-400 mt-2">➔ RGB_MSB: null<br/>➔ RGB_LSB: null<br/>➔ RGBA_MSB: null<br/>➔ RGBA_LSB: <span className="text-emerald-400">Found "Secret!"</span></div>
        },
        { 
          title: "5. The Glass Window", text: "Ignores the Alpha (Transparency) channel to prevent massive false alarms from empty static.",
          action: "c5", button: "Scan Alpha", 
          render: (s:string) => !s ? null : s==="c5" ? <div className="text-sky-400 animate-pulse mt-2">Scanning 0xFF bytes...</div> : <div className="text-amber-400 mt-2">➔ Alpha scanned: 0xFFFF...<br/><span className="text-emerald-400">✅ Skipped to prevent false alarm</span></div>
        },
        { 
          title: "6. The Gibberish Gate", text: "Enforces that >90% of extracted characters must be printable (no alien symbols).",
          action: "c6", button: "Decode Gibberish", 
          render: (s:string) => !s ? null : s==="c6" ? <div className="text-sky-400 animate-pulse mt-2">Calculating printable ratio...</div> : <div className="text-amber-400 mt-2">➔ String: "\x00\x1f\x7f\ufffd"<br/>➔ Printable: 10%<br/><span className="text-rose-400">❌ Rejected.</span></div>
        },
        { 
          title: "7. The Monkey NLP Filter", text: "Uses Shannon Entropy and vowel ratios to reject random keyboard-smash noise.",
          action: "c7", button: "Monkey Type", 
          render: (s:string) => !s ? null : s==="c7" ? <div className="text-sky-400 animate-pulse mt-2">Running NLP filters...</div> : <div className="text-amber-400 mt-2">➔ String: "HDFH JKDF"<br/>➔ Vowels: 0<br/><span className="text-rose-400">❌ Rejected.</span></div>
        },
        { 
          title: "8. The Secret Handshake", text: "Hunts for exact 'Steg' magic bytes.",
          action: "c8", button: "Check Devglan", 
          render: (s:string) => !s ? null : s==="c8" ? <div className="text-sky-400 animate-pulse mt-2">Hunting magic bytes...</div> : <div className="text-emerald-400 mt-2">➔ Found Hex: 53 74 65 67<br/>➔ "Steg" Header verified.</div>
        },
        { 
          title: "9. The Backpack Tag", text: "Catches 32-bit big/little-endian length prefixes.",
          action: "c9", button: "Read Prefix", 
          render: (s:string) => !s ? null : s==="c9" ? <div className="text-sky-400 animate-pulse mt-2">Reading 32-bit header...</div> : <div className="text-amber-400 mt-2">➔ Big-Endian Prefix: 0x00000008<br/>➔ Reading exactly 8 bytes.</div>
        },
        { 
          title: "10. The Stop Sign", text: "Catches C/C++ style embedded strings walking backward from 0x00.",
          action: "c10", button: "Walk Backwards", 
          render: (s:string) => !s ? null : s==="c10" ? <div className="text-sky-400 animate-pulse mt-2">Walking backwards from 0x00...</div> : <div className="text-amber-400 mt-2">➔ Walkback string: "Hello\x00"<br/>➔ Reached Stop Sign at offset -6.</div>
        },
        { 
          title: "11. The Brute Force", text: "Scrapes for any floating human text using Regex as a last resort.",
          action: "c11", button: "Run Regex", 
          render: (s:string) => !s ? null : s==="c11" ? <div className="text-sky-400 animate-pulse mt-2">Scanning 32KB chunk...</div> : <div className="text-emerald-400 mt-2">➔ Regex {"/[ -~\\t\\n\\r]{8,}/g"} found floating string: "my_password".</div>
        },
        { 
          title: "12. The Priority Rule", text: "Prioritizes RGB-only streams over RGBA because hackers rarely use Alpha.",
          action: "c12", button: "Check Collision", 
          render: (s:string) => !s ? null : s==="c12" ? <div className="text-sky-400 animate-pulse mt-2">Evaluating collision...</div> : <div className="text-amber-400 mt-2">➔ Matches in RGB_MSB and RGBA_MSB.<br/>➔ Returning RGB_MSB first.</div>
        },
        { 
          title: "13. The Zip File Radar", text: "Calculates 0-to-1 ratios. If skewed, it flags an anomaly (likely an encrypted ZIP file).",
          action: "c13", button: "Check Bias", 
          render: (s:string) => !s ? null : s==="c13" ? <div className="text-sky-400 animate-pulse mt-2">Counting 0s and 1s...</div> : <div className="text-rose-400 mt-2">➔ LSB 1s: 60%. LSB 0s: 40%.<br/>⚠️ Anomaly detected! Possible ZIP file.</div>
        }
      ]
    }
  ];

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 text-center flex items-center justify-center gap-3">
        <ShieldAlert className="text-rose-500" size={40} /> The 27 Master Defenses
      </h2>
      <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto font-medium text-center">
        Our forensic engine is powered by specific NPM packages working alongside our custom logic. Let's see exactly how each package handles edge cases!
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 space-y-3">
          {modules.map((mod, i) => (
            <button
              key={i}
              onClick={() => { setActiveModule(i); setDemoState({}); }}
              className={`w-full text-left p-4 rounded-2xl border-4 transition-all flex items-center gap-3 shadow-sm ${activeModule === i ? 'border-sky-400 bg-sky-50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="text-2xl bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">{mod.icon}</div>
              <div className="min-w-0">
                <p className={`font-black truncate ${activeModule === i ? 'text-sky-900' : 'text-slate-700'}`}>{mod.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${activeModule === i ? 'bg-sky-200 text-sky-800' : 'bg-slate-200 text-slate-500'}`}>
                    {mod.package.split('+')[0]}
                  </span>
                  <span className={`text-xs font-bold ${activeModule === i ? 'text-sky-600' : 'text-slate-400'}`}>{mod.count} Defenses</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="w-full md:w-2/3 flex flex-col max-h-[800px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-slate-800 flex flex-col h-full"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-4 mb-4 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                      {modules[activeModule].icon} {modules[activeModule].name}
                    </h3>
                    <p className="text-slate-400 font-medium mt-1">{modules[activeModule].desc}</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex flex-col items-center flex-shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Powered By</span>
                    <span className="text-sm font-black text-emerald-400">{modules[activeModule].package}</span>
                  </div>
                </div>
              </div>

              {/* Main Module Interactive Demo Box (If it exists) */}
              {modules[activeModule].demo && (
                <div className="bg-slate-800 rounded-2xl p-5 border-2 border-sky-500/30 mb-6 flex-shrink-0 shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-black text-sky-400 flex items-center gap-2"><Zap size={18}/> {modules[activeModule].demo.title}</h4>
                    <button 
                      onClick={() => triggerDemo(activeModule, modules[activeModule].demo.action)}
                      className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow transition-colors"
                    >
                      {modules[activeModule].demo.button}
                    </button>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{modules[activeModule].demo.desc}</p>
                  {modules[activeModule].demo.render(demoState[activeModule])}
                </div>
              )}

              {/* Edge Cases List */}
              <div className="overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-2 flex-grow">
                <h4 className="font-black text-white sticky top-0 bg-slate-900 py-2 border-b border-slate-800 z-10">
                  All {modules[activeModule].count} Edge Cases Handled:
                </h4>
                {modules[activeModule].cases.map((c: any, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-sky-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h5 className="font-bold text-sky-300">{c.title}</h5>
                      {c.action && (
                        <button 
                          onClick={() => triggerDemo(activeModule + "_" + i, c.action)}
                          className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white px-3 py-1 rounded text-[10px] font-black uppercase transition-colors flex-shrink-0 whitespace-nowrap"
                        >
                          {c.button || "Run Demo"}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{c.text}</p>
                    
                    {/* Inline Case Interactive Result */}
                    {c.action && demoState[activeModule + "_" + i] && (
                      <div className="bg-slate-900 border border-slate-700 p-3 mt-3 rounded-xl font-mono text-xs shadow-inner">
                        {c.render(demoState[activeModule + "_" + i])}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
