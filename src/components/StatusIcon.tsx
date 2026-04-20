import { CheckCircle2, Info, AlertCircle } from "lucide-react";

export function StatusIcon({ status }: { status: string }) {
  if (status === "PASS") return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
  if (status === "INFO") return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
  return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
}
