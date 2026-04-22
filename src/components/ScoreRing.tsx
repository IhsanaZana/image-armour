export function ScoreRing({ score }: { score: number }) {
  const color = score <= 10 ? "#10b981" : score < 40 ? "#f59e0b" : "#ef4444";
  const glow = score <= 10 ? "rgba(16,185,129,0.2)" : score < 40 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)";
  const dash = 283;
  const offset = dash - (dash * Math.min(score, 100)) / 100;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <div 
        className="absolute inset-0 rounded-full blur-[40px] opacity-20 transition-all duration-1000"
        style={{ backgroundColor: color }}
      />
      <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="45" fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={dash} strokeDashoffset={offset}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          style={{ 
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.5s ease",
            filter: `drop-shadow(0 0 12px ${glow})`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-6xl font-light tracking-tighter text-white">{score}</span>
        <span className="text-[10px] text-slate-500 font-bold tracking-[0.3em] mt-2 uppercase">Risk Score</span>
      </div>
    </div>
  );
}
