import { useState } from "react";
import {
  useGetProcurementRecommendations, getGetProcurementRecommendationsQueryKey,
  useRunProcurementOrchestrator,
  useGetCrudeSources, getGetCrudeSourcesQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function statusStyle(status: string): { color: string; bg: string; border: string } {
  switch (status) {
    case "RECOMMENDED": return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" };
    case "VIABLE":      return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" };
    case "MARGINAL":    return { color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)" };
    case "AVOID":       return { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" };
    default:            return { color: "hsl(2 78% 57%)", bg: "rgba(217,64,52,0.1)", border: "rgba(217,64,52,0.3)" };
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoadingRecs || isLoadingSources || !recs || !sources) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Procurement Orchestrator</h2>
          <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
            AI-DRIVEN ALTERNATIVE SOURCING RECOMMENDATIONS
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => runOrch.mutate({ data: { scenarioId: "CURRENT" } })}
          disabled={runOrch.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition-all disabled:opacity-60"
          style={{
            background: "rgba(217,64,52,0.1)",
            border: "1px solid rgba(217,64,52,0.3)",
            color: "hsl(2 78% 65%)",
          }}>
          <Cpu className={`w-3.5 h-3.5 ${runOrch.isPending ? "animate-pulse" : ""}`} />
          RUN ORCHESTRATOR
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ── RECOMMENDATIONS LIST ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-[9px] font-mono tracking-[0.2em]" style={{ color: "hsl(355 8% 50%)" }}>
            SOURCING RECOMMENDATIONS — RANKED BY OVERALL SCORE
          </div>

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
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(20,6,8,0.7)",
                  border: "1px solid rgba(217,64,52,0.12)",
                  borderLeft: `3px solid ${borderColor}`,
                }}>

                {/* Main row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}>

                  {/* Rank badge */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-sm"
                    style={{ background: `${borderColor}15`, color: borderColor, border: `1px solid ${borderColor}30` }}>
                    {rec.rank}
                  </div>

                  {/* Supplier info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-base leading-tight font-display">
                      {rec.supplier}
                    </div>
                    <div className="text-[10px] font-mono mt-0.5 flex items-center gap-1.5"
                      style={{ color: "hsl(355 8% 55%)" }}>
                      <span>{rec.country}</span>
                      <span style={{ color: "rgba(217,64,52,0.3)" }}>•</span>
                      <span>{rec.route}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right mr-4 hidden sm:block">
                    <div className="text-[9px] font-mono tracking-widest mb-0.5" style={{ color: "hsl(355 8% 50%)" }}>
                      SCORE
                    </div>
                    <div className="text-xl font-mono font-bold text-white">{rec.overallScore}</div>
                    <div className="h-1 w-16 rounded-full mt-1" style={{ background: "rgba(217,64,52,0.15)" }}>
                      <div className="h-full rounded-full" style={{ width: `${rec.overallScore}%`, background: borderColor }} />
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className="px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider shrink-0"
                    style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                    {rec.status}
                  </span>

                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    style={{ color: "hsl(355 8% 45%)" }} />
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden">
                      <div className="border-t" style={{ borderColor: "rgba(217,64,52,0.1)" }}>
                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x"
                          style={{ borderColor: "rgba(217,64,52,0.1)" }}>
                          {[
                            { label: "SPOT PRICE", value: `$${rec.spotPrice}/bbl` },
                            { label: "TANKER AVAIL.", value: `${rec.tankerAvailability}%` },
                            { label: "PORT CONGESTION", value: `${rec.portCongestion}%` },
                            { label: "GRADE COMPAT.", value: `${rec.gradeCompatibility}%` },
                          ].map((item) => (
                            <div key={item.label} className="px-5 py-3">
                              <div className="text-[8px] font-mono tracking-widest mb-1" style={{ color: "hsl(355 8% 48%)" }}>
                                {item.label}
                              </div>
                              <div className="text-sm font-mono font-bold text-white">{item.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* AI Reasoning */}
                        <div className="px-5 py-4 flex items-start gap-3"
                          style={{ background: "rgba(217,64,52,0.04)" }}>
                          <div className="p-2 rounded-lg mt-0.5 shrink-0"
                            style={{ background: "rgba(217,64,52,0.12)", border: "1px solid rgba(217,64,52,0.2)" }}>
                            <Cpu className="w-4 h-4" style={{ color: "hsl(2 78% 65%)" }} />
                          </div>
                          <div>
                            <div className="text-[8px] font-mono tracking-widest mb-1.5" style={{ color: "hsl(2 78% 60%)" }}>
                              AI AGENT REASONING
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 80%)" }}>{rec.reasoning}</p>
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

        {/* ── CRUDE SOURCES SIDEBAR ────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(20,6,8,0.7)", border: "1px solid rgba(217,64,52,0.15)" }}>
          <div className="px-5 py-4 border-b flex items-center gap-2"
            style={{ borderColor: "rgba(217,64,52,0.12)" }}>
            <ChevronRight className="w-4 h-4" style={{ color: "hsl(2 78% 57%)" }} />
            <span className="text-xs font-bold font-display">
              Global Crude Sources
            </span>
          </div>

          <div className="p-3 space-y-2">
            {sources.map((src, i) => (
              <motion.div
                key={src.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                style={{ background: "rgba(217,64,52,0.03)", border: "1px solid rgba(217,64,52,0.08)" }}>
                <div>
                  <div className="text-xs font-bold text-white">{src.supplier}</div>
                  <div className="text-[9px] font-mono mt-0.5" style={{ color: "hsl(355 8% 50%)" }}>
                    {src.gradeType}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold" style={{ color: "hsl(2 78% 65%)" }}>
                    ${src.currentPrice}
                  </div>
                  <div className="text-[9px] font-mono" style={{ color: "hsl(355 8% 50%)" }}>
                    {src.typicalVolume}M bpd
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
