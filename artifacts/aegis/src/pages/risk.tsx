import {
  useGetRiskScores, getGetRiskScoresQueryKey,
  useRefreshRiskScores,
  useGetNewsSignals, getGetNewsSignalsQueryKey,
  useGetSupplierRisks, getGetSupplierRisksQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ShieldAlert, Radio, Activity, Compass, AlertOctagon, TrendingUp, Sparkles, MapPin } from "lucide-react";
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
    <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/5"
      style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="w-14 h-14 relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="72%" outerRadius="100%"
            barSize={6}
            data={[{ value: score }]}
            startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: "rgba(255,255,255,0.05)" }}
              dataKey="value"
              cornerRadius={4}
              fill={color}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute left-0 right-0 bottom-1 text-center font-mono text-[10px] font-bold" style={{ color }}>
          {score.toFixed(1)}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">{corridor}</div>
        <div className="text-[8px] font-mono text-muted-foreground mt-0.5">{level} THREAT</div>
      </div>
    </div>
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
    <div className="space-y-6">
      
      {/* Redesigned top actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Risk Intelligence Workspace</h2>
          <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
            LIVE CORRIDOR THREAT ASSESSMENTS & GEOPOLITICAL LOGS
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleRefresh}
          disabled={refresh.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-primary/10 border border-primary/20 hover:border-primary/40 text-primary transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refresh.isPending ? "animate-spin" : ""}`} />
          REFRESH INTEL CORES
        </motion.button>
      </div>

      {/* Row 1: Corridor threat levels horizontal bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scores.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <RiskGauge score={s.score} corridor={s.corridor} level={s.level} />
          </motion.div>
        ))}
      </div>

      {/* Primary Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Supplier vulnerability matrix & Maps summary */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Supplier Vulnerability Matrix */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl overflow-hidden border border-border/5"
            style={{ background: "rgba(20,6,8,0.7)" }}
          >
            <div className="px-5 py-4 border-b border-border/5 flex items-center justify-between"
              style={{ background: "rgba(217,64,52,0.02)" }}>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono font-bold tracking-widest text-white">SUPPLIER RISK MATRIX</span>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground">{suppliers.length} SUPPLIERS LOGGED</span>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/5 text-[9px] font-mono tracking-wider text-muted-foreground">
                    <th className="pb-3 pl-2">SUPPLIER</th>
                    <th className="pb-3">COUNTRY</th>
                    <th className="pb-3">PRIMARY ROUTE</th>
                    <th className="pb-3 text-right">SHARE%</th>
                    <th className="pb-3 pr-2 text-right">RISK LEVEL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5 text-xs">
                  {suppliers.map((sup, i) => {
                    const color = riskColor(sup.riskLevel);
                    return (
                      <motion.tr
                        key={sup.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5 pl-2 font-bold text-white">{sup.supplier}</td>
                        <td className="py-3.5 font-mono text-muted-foreground">{sup.country}</td>
                        <td className="py-3.5 font-mono text-slate-300">{sup.primaryRoute}</td>
                        <td className="py-3.5 text-right font-mono font-bold text-white">
                          <div>{sup.share}%</div>
                          <div className="w-20 h-1 bg-muted/40 rounded-full mt-1.5 ml-auto overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${sup.share}%`, background: color }} />
                          </div>
                        </td>
                        <td className="py-3.5 pr-2 text-right">
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest"
                            style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                            {sup.riskLevel}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Heatmap corridor tracking description */}
          <div className="rounded-2xl p-5 border border-border/5" style={{ background: "rgba(20,6,8,0.7)" }}>
            <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-primary mb-3">
              <Compass className="w-3.5 h-3.5" /> COGNITIVE ROUTE RECOMMENDATIONS
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              The AI Core recommends rerouting Strait of Hormuz transits to domestic pipelines if the calculated score exceeds **75.0** (currently elevated at {scores[0]?.score.toFixed(1)}). Current Cape Route latencies add approximately **12 days** to standard delivery schedules.
            </p>
          </div>
        </div>

        {/* Right: Live Intel Feed */}
        <div className="rounded-2xl overflow-hidden border border-border/5 flex flex-col"
          style={{ background: "rgba(10,3,5,0.85)", height: "calc(100vh - 18rem)", minHeight: "520px" }}>
          
          <div className="px-4 py-3.5 border-b border-border/5 flex items-center justify-between shrink-0"
            style={{ background: "rgba(217,64,52,0.05)" }}>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-primary">LIVE INTEL STREAM</span>
            </div>
            <span className="text-[8px] font-mono text-muted-foreground">{signals.length} ACTIVE SIGNALS</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {signals.map((sig, i) => {
              const sev = sig.severity;
              const color = sev === "CRITICAL" ? "#ef4444" : sev === "HIGH" ? "#f59e0b" : "#22c55e";
              return (
                <motion.div
                  key={sig.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl p-3 border border-border/5 relative overflow-hidden"
                  style={{
                    background: `${color}04`,
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${color}15`, color }}>
                      {sev}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {new Date(sig.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/60 ml-auto">{sig.source}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug mb-1">{sig.headline}</h4>
                  <p className="text-[10px] font-mono text-slate-400 border-t border-border/5 pt-1.5 mt-1.5">
                    ▸ {sig.extractedRisk}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
