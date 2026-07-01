import {
  useGetRiskScores, getGetRiskScoresQueryKey,
  useRefreshRiskScores,
  useGetNewsSignals, getGetNewsSignalsQueryKey,
  useGetSupplierRisks, getGetSupplierRisksQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ShieldAlert, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { useToast } from "@/hooks/use-toast";

function riskColor(level: string) {
  switch (level) {
    case "CRITICAL": return "#ef4444";
    case "HIGH": return "#f59e0b";
    case "MODERATE": return "#fb923c";
    default: return "#22c55e";
  }
}

function RiskGauge({ score, corridor, level }: { score: number; corridor: string; level: string }) {
  const color = riskColor(level);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "rgba(20,6,8,0.7)", border: `1px solid ${color}25` }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${color}08 0%, transparent 60%)` }} />

      <div className="w-28 h-28 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="68%" outerRadius="100%"
            barSize={10}
            data={[{ value: score }]}
            startAngle={210} endAngle={-30}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: "rgba(255,255,255,0.05)" }}
              dataKey="value"
              cornerRadius={6}
              fill={color}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold" style={{ color }}>{score}</span>
        </div>
      </div>

      <div className="text-center mt-1">
        <div className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 80%)" }}>
          {corridor}
        </div>
        <div className="text-[9px] font-mono px-2 py-0.5 rounded-full mt-1.5 inline-block font-bold"
          style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
          {level}
        </div>
      </div>
      {/* Glow dot bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}`, opacity: 0.6 }} />
    </motion.div>
  );
}

export default function Risk() {
  const { data: scores, isLoading: isLoadingScores } = useGetRiskScores({ query: { queryKey: getGetRiskScoresQueryKey() } });
  const { data: signals, isLoading: isLoadingSignals } = useGetNewsSignals({ query: { queryKey: getGetNewsSignalsQueryKey() } });
  const { data: suppliers, isLoading: isLoadingSuppliers } = useGetSupplierRisks({ query: { queryKey: getGetSupplierRisksQueryKey() } });
  const refresh = useRefreshRiskScores();
  const { toast } = useToast();

  const handleRefresh = () => {
    refresh.mutate(undefined, {
      onSuccess: () => toast({ title: "Signals Refreshed", description: "Risk scores updated." }),
    });
  };

  if (isLoadingScores || isLoadingSignals || isLoadingSuppliers || !scores || !signals || !suppliers) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-96 rounded-2xl col-span-2" style={{ background: "rgba(217,64,52,0.08)" }} />
          <Skeleton className="h-96 rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Intelligence</h2>
          <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
            LIVE CORRIDOR & SUPPLIER THREAT ASSESSMENT
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={handleRefresh}
          disabled={refresh.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition-all"
          style={{
            background: "rgba(217,64,52,0.1)",
            border: "1px solid rgba(217,64,52,0.3)",
            color: "hsl(2 78% 65%)",
          }}>
          <RefreshCw className={`w-3.5 h-3.5 ${refresh.isPending ? "animate-spin" : ""}`} />
          REFRESH SIGNALS
        </motion.button>
      </div>

      {/* ── CORRIDOR GAUGES (full row) ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full flex items-center gap-2 mb-1">
          <ShieldAlert className="w-4 h-4" style={{ color: "hsl(2 78% 57%)" }} />
          <span className="text-xs font-mono font-bold tracking-widest" style={{ color: "hsl(355 8% 55%)" }}>
            CORRIDOR THREAT LEVELS
          </span>
        </motion.div>
        {scores.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <RiskGauge score={s.score} corridor={s.corridor} level={s.level} />
          </motion.div>
        ))}
      </div>

      {/* ── BOTTOM SECTION: Table + Feed ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Supplier Table (3 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{ background: "rgba(20,6,8,0.7)", border: "1px solid rgba(217,64,52,0.15)" }}>

          <div className="px-5 py-4 border-b flex items-center gap-2"
            style={{ borderColor: "rgba(217,64,52,0.12)" }}>
            <ShieldAlert className="w-4 h-4" style={{ color: "hsl(2 78% 57%)" }} />
            <span className="text-sm font-bold font-display">Supplier Vulnerability Matrix</span>
          </div>

          <div className="p-3 space-y-2">
            {/* Header row */}
            <div className="grid grid-cols-12 px-3 pb-1 text-[9px] font-mono tracking-widest"
              style={{ color: "hsl(355 8% 45%)" }}>
              <span className="col-span-4">SUPPLIER</span>
              <span className="col-span-3">ROUTE</span>
              <span className="col-span-2 text-right">SHARE%</span>
              <span className="col-span-3 text-right">RISK LEVEL</span>
            </div>

            {suppliers.map((sup, i) => {
              const color = riskColor(sup.riskLevel);
              return (
                <motion.div
                  key={sup.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="grid grid-cols-12 items-center px-3 py-3 rounded-xl transition-colors hover:bg-white/[0.02]"
                  style={{ background: "rgba(217,64,52,0.03)", border: "1px solid rgba(217,64,52,0.08)" }}>
                  <div className="col-span-4">
                    <div className="text-sm font-bold text-white">{sup.supplier}</div>
                    <div className="text-[9px] font-mono" style={{ color: "hsl(355 8% 50%)" }}>{sup.country}</div>
                  </div>
                  <div className="col-span-3 text-[10px] font-mono" style={{ color: "hsl(355 8% 60%)" }}>
                    {sup.primaryRoute}
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-sm font-mono font-bold text-white">{sup.share}%</div>
                    {/* Share bar */}
                    <div className="h-0.5 rounded-full mt-1 ml-auto" style={{ width: `${sup.share * 2}%`, maxWidth: "100%", background: color }} />
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider"
                      style={{ background: `${color}14`, color, border: `1px solid ${color}30` }}>
                      {sup.riskLevel}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Live Signal Feed (2 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "rgba(10,3,5,0.85)",
            border: "1px solid rgba(217,64,52,0.15)",
            maxHeight: "520px",
          }}>
          <div className="px-4 py-3 border-b flex items-center justify-between shrink-0"
            style={{ borderColor: "rgba(217,64,52,0.12)", background: "rgba(217,64,52,0.05)" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.7)" }} />
              <Radio className="w-3.5 h-3.5" style={{ color: "hsl(2 78% 60%)" }} />
              <span className="text-[10px] font-mono font-bold tracking-[0.2em]" style={{ color: "hsl(2 78% 65%)" }}>
                LIVE INTEL FEED
              </span>
            </div>
            <span className="text-[9px] font-mono" style={{ color: "hsl(355 8% 45%)" }}>
              {signals.length} SIGNALS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {signals.map((sig, i) => {
              const sev = sig.severity;
              const color = sev === "CRITICAL" ? "#ef4444" : sev === "HIGH" ? "#f59e0b" : "#22c55e";
              return (
                <motion.div
                  key={sig.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="rounded-xl p-3 relative overflow-hidden"
                  style={{
                    background: `${color}06`,
                    border: `1px solid ${color}20`,
                    borderLeft: `3px solid ${color}`,
                  }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold"
                      style={{ background: `${color}18`, color }}>
                      {sev}
                    </span>
                    <span className="text-[9px] font-mono" style={{ color: "hsl(355 8% 50%)" }}>
                      {new Date(sig.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[9px] font-mono ml-auto" style={{ color: "hsl(355 8% 45%)" }}>{sig.source}</span>
                  </div>
                  <p className="text-xs text-white font-medium leading-snug mb-1.5">{sig.headline}</p>
                  <div className="text-[9px] font-mono leading-relaxed px-2 py-1.5 rounded"
                    style={{ background: "rgba(0,0,0,0.3)", color: "hsl(355 8% 60%)" }}>
                    ▸ {sig.extractedRisk}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
