export function StatusBadge({ status, impact }: { status: string; impact: number }) {
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
