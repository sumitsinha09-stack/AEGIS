import { useState } from "react";
import {
  useGetProcurementRecommendations, getGetProcurementRecommendationsQueryKey,
  useRunProcurementOrchestrator,
  useGetCrudeSources, getGetCrudeSourcesQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu, ChevronDown, ChevronRight, Anchor, Globe, DollarSign, ShieldAlert, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

function statusStyle(status: string): { color: string; bg: string; border: string } {
  switch (status) {
    case "RECOMMENDED": return { color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" };
    case "VIABLE":      return { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" };
    case "MARGINAL":    return { color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)" };
    case "AVOID":       return { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" };
    default:            return { color: "hsl(2 78% 57%)", bg: "rgba(217,64,52,0.08)", border: "rgba(217,64,52,0.2)" };
  }
}

function leftBorder(status: string): string {
  switch (status) {
    case "RECOMMENDED": return "#22c55e";
    case "VIABLE":      return "#f59e0b";
    case "MARGINAL":    return "#fb923c";
    case "AVOID":       return "#ef4444";
    default:            return "hsl(2 78% 57%)";
  }
}

export default function Procurement() {
  const { data: recs, isLoading: isLoadingRecs } = useGetProcurementRecommendations({ query: { queryKey: getGetProcurementRecommendationsQueryKey() } });
  const { data: sources, isLoading: isLoadingSources } = useGetCrudeSources({ query: { queryKey: getGetCrudeSourcesQueryKey() } });
  const runOrch = useRunProcurementOrchestrator();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [regionFilter, setRegionFilter] = useState("all");

  const handleRun = () => {
    runOrch.mutate({ data: { scenarioId: "CURRENT" } }, {
      onSuccess: () => {
        toast({ title: "Sourcing Recalculated", description: "Procurement rank adjustments updated." });
      }
    });
  };

  if (isLoadingRecs || isLoadingSources || !recs || !sources) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
        ))}
      </div>
    );
  }

  // Group sources regions
  const filteredSources = sources.filter(s => {
    if (regionFilter === "all") return true;
    if (regionFilter === "middle_east") return ["Iraq", "Saudi Arabia", "UAE", "Kuwait"].includes(s.supplier);
    if (regionFilter === "russia") return s.supplier === "Russia";
    if (regionFilter === "others") return !["Iraq", "Saudi Arabia", "UAE", "Kuwait", "Russia"].includes(s.supplier);
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Procurement Intelligence</h2>
          <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
            PORTFOLIO DIVERSIFICATION & REAL-TIME SOURCING RECOMMENDATIONS
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleRun}
          disabled={runOrch.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-primary text-white shadow-lg shadow-primary/20 transition-all disabled:opacity-60 self-start sm:self-auto"
        >
          <Cpu className={`w-3.5 h-3.5 ${runOrch.isPending ? "animate-pulse" : ""}`} />
          RE-RUN SOURCING OPTIMIZER
        </motion.button>
      </div>

      {/* Procurement KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "SPOT BRENT CRUDE", value: "$82.40/bbl", sub: "Global Benchmark", color: "#f59e0b", icon: DollarSign },
          { label: "SUPPLIERS INDEXED", value: `${sources.length} Active`, sub: "Geopolitically Mapped", color: "#3b82f6", icon: Globe },
          { label: "RECOMMENDED SOURCES", value: `${recs.filter(r => r.status === "RECOMMENDED").length} Optimal`, sub: "Direct Pipelines Ready", color: "#22c55e", icon: CheckCircle2 },
          { label: "CRITICAL RISK CHANNELS", value: "2 Corridors", sub: "Hormuz & Red Sea Alert", color: "#ef4444", icon: ShieldAlert },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl p-5 border border-border/5 relative overflow-hidden" style={{ background: "rgba(20,6,8,0.7)" }}>
            <div className="text-[9px] font-mono tracking-widest text-muted-foreground mb-1">{kpi.label}</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{kpi.value}</div>
            <div className="text-[9px] font-mono text-muted-foreground mt-1.5">{kpi.sub}</div>
            <kpi.icon className="absolute right-4 bottom-4 w-12 h-12 opacity-5 pointer-events-none" style={{ color: kpi.color }} />
          </div>
        ))}
      </div>

      {/* Primary Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Pane: Sourcing Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground">RECOMMENDED CONTRACT ALLOCATIONS (RANKED)</div>
          
          <div className="space-y-3">
            {recs.map((rec, i) => {
              const st = statusStyle(rec.status);
              const borderColor = leftBorder(rec.status);
              const isExpanded = expandedId === rec.id;

              return (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border/5 overflow-hidden"
                  style={{
                    background: "rgba(20,6,8,0.7)",
                    borderLeft: `3px solid ${borderColor}`,
                  }}
                >
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-xs"
                      style={{ background: `${borderColor}15`, color: borderColor, border: `1px solid ${borderColor}30` }}>
                      #{rec.rank}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-base leading-tight">
                        {rec.supplier}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{rec.country}</span>
                        <span>·</span>
                        <span>{rec.route}</span>
                      </div>
                    </div>

                    <div className="text-right mr-4 hidden sm:block font-mono">
                      <div className="text-[8px] text-muted-foreground tracking-widest uppercase">SCORE</div>
                      <div className="text-base font-bold text-white mt-0.5">{rec.overallScore}</div>
                    </div>

                    <span className="px-2.5 py-1 rounded text-[8px] font-mono font-bold tracking-wider shrink-0"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {rec.status}
                    </span>

                    <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/5">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-border/5">
                            {[
                              { label: "SPOT CRUDE VALUE", value: `$${rec.spotPrice}/bbl` },
                              { label: "TANKER AVAILABILITY", value: `${rec.tankerAvailability}%` },
                              { label: "PORT CONGESTION INDEX", value: `${rec.portCongestion}%` },
                              { label: "REFINERY COMPATIBILITY", value: `${rec.gradeCompatibility}%` },
                            ].map((item) => (
                              <div key={item.label} className="px-5 py-3.5">
                                <div className="text-[8px] font-mono tracking-widest text-muted-foreground mb-1">
                                  {item.label}
                                </div>
                                <div className="text-xs font-mono font-bold text-white">{item.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* AI reasoning block */}
                          <div className="px-5 py-4 flex items-start gap-3"
                            style={{ background: "rgba(217,64,52,0.02)" }}>
                            <div className="p-2 bg-primary/10 border border-primary/25 rounded-xl shrink-0 mt-0.5">
                              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                            </div>
                            <div>
                              <div className="text-[8px] font-mono tracking-widest text-primary font-bold">
                                REASONING CORE DECISION
                              </div>
                              <p className="text-xs leading-relaxed text-slate-300 mt-1">{rec.reasoning}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Sourcing list with filters */}
        <div className="space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground">GLOBAL CRUDE SOURCE DIRECTORY</div>
          
          <div className="rounded-2xl border border-border/5 p-5 space-y-4" style={{ background: "rgba(20,6,8,0.7)" }}>
            
            {/* Filters */}
            <div className="flex bg-muted/40 p-0.5 rounded-lg text-[9px] font-mono justify-between">
              {[
                { id: "all", label: "ALL" },
                { id: "middle_east", label: "GULF" },
                { id: "russia", label: "RUSSIA" },
                { id: "others", label: "OTHERS" },
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setRegionFilter(r.id)}
                  className={`px-2 py-1 rounded transition-all ${regionFilter === r.id ? "bg-primary text-white font-bold" : "text-muted-foreground"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredSources.map((src, i) => (
                <motion.div
                  key={src.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] border border-border/5 transition-all"
                  style={{ background: "rgba(255,255,255,0.01)" }}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{src.supplier}</div>
                    <div className="text-[9px] font-mono text-muted-foreground mt-0.5">{src.gradeType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-primary">${src.currentPrice}</div>
                    <div className="text-[8px] font-mono text-muted-foreground mt-0.5">{src.typicalVolume}M bpd normal</div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
