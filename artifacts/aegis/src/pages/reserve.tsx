import { useState } from "react";
import {
  useGetReserveStatus, getGetReserveStatusQueryKey,
  useGetDrawdownSchedule, getGetDrawdownScheduleQueryKey,
  useOptimizeReserve,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowRight, Droplets, Sliders, Sparkles, Compass, ShieldAlert, Cpu } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const CHART_STYLE = {
  contentStyle: {
    background: "hsl(355 28% 8%)",
    border: "1px solid rgba(217,64,52,0.25)",
    borderRadius: "8px",
    fontSize: "11px",
    fontFamily: "DM Mono, monospace",
  },
  axisStyle: { stroke: "rgba(255,255,255,0.12)", fontSize: 10, fontFamily: "DM Mono, monospace" },
};

export default function Reserve() {
  const { data: status, isLoading: isLoadingStatus } = useGetReserveStatus({ query: { queryKey: getGetReserveStatusQueryKey() } });
  const { data: schedule, isLoading: isLoadingSchedule } = useGetDrawdownSchedule({ query: { queryKey: getGetDrawdownScheduleQueryKey() } });
  const optimize = useOptimizeReserve();
  const { toast } = useToast();
  const [drawdownRate, setDrawdownRate] = useState(2.5);

  if (isLoadingStatus || isLoadingSchedule || !status || !schedule) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-xl" style={{ background: "rgba(217,64,52,0.08)" }} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-96 rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
          <Skeleton className="h-96 rounded-2xl col-span-2" style={{ background: "rgba(217,64,52,0.08)" }} />
        </div>
      </div>
    );
  }

  const isCritical = status.currentDays < 30;
  const fillRatio = status.currentDays / status.capacityDays;
  const circumference = 2 * Math.PI * 52;
  const strokeDash = fillRatio * circumference;
  const mainColor = isCritical ? "#ef4444" : "hsl(2 78% 57%)";
  const mainGlow = isCritical ? "rgba(239,68,68,0.3)" : "rgba(217,64,52,0.25)";

  const handleOptimize = () => {
    optimize.mutate({ data: { scenarioId: "MANUAL", drawdownRateMbpd: drawdownRate } }, {
      onSuccess: () => toast({ title: "Reserve Re-optimized", description: "Drawdown schedule updated." }),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Redesigned Header */}
      <div>
        <h2 className="text-2xl font-bold">Reserve Optimizer Command</h2>
        <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
          STRATEGIC PETROLEUM RESERVE (SPR) INVENTORY & DRAWDOWN SIMULATOR
        </p>
      </div>

      {/* Recommended action banner */}
      {status.recommendedAction && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4.5 flex items-center justify-between gap-4 border"
          style={{
            background: isCritical ? "rgba(239,68,68,0.05)" : "rgba(217,64,52,0.05)",
            borderColor: isCritical ? "rgba(239,68,68,0.25)" : "rgba(217,64,52,0.2)",
            boxShadow: `0 0 24px ${mainGlow}15`,
          }}
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${mainColor}15`, border: `1px solid ${mainColor}25` }}>
              <AlertTriangle className="w-5 h-5 animate-bounce" style={{ color: mainColor }} />
            </div>
            <div>
              <div className="text-[9px] font-mono tracking-widest uppercase" style={{ color: mainColor }}>
                RECOMMENDED CORE ACTION
              </div>
              <h3 className="font-bold text-white text-base mt-0.5">
                {status.recommendedAction}
              </h3>
            </div>
          </div>
          <button
            onClick={handleOptimize}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl font-mono font-bold text-xs bg-primary text-white shadow-lg shadow-primary/10 transition-all hover:bg-primary-hover"
          >
            EXECUTE ACTION <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Split view layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Pane: Circular Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-6.5 flex flex-col items-center justify-center border border-border/5"
          style={{ background: "rgba(20,6,8,0.7)" }}
        >
          <div className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-6">
            SPR Inventory Cover
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke={mainColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={circumference / 4}
                style={{ filter: `drop-shadow(0 0 6px ${mainGlow})`, transition: "stroke-dasharray 1s ease" }}
              />
              <circle cx="60" cy="60" r="42" fill="none" stroke={`${mainColor}10`} strokeWidth="1.5" />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets className="w-4 h-4 mb-0.5" style={{ color: mainColor }} />
              <span className="text-4xl font-mono font-bold text-white leading-none">
                {status.currentDays}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground mt-1">
                / {status.capacityDays} Max Days
              </span>
            </div>
          </div>

          {/* Metrics grids */}
          <div className="grid grid-cols-2 gap-3.5 w-full">
            {[
              { label: "FILL RATIO", value: `${status.fillPercent}%`, color: mainColor },
              { label: "RELEASE RATE", value: `${status.drawdownRate} Mbpd`, color: "#f59e0b" },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-xl border border-border/5"
                style={{ background: "rgba(255,255,255,0.01)" }}>
                <div className="text-[8px] font-mono tracking-widest text-muted-foreground mb-1">{item.label}</div>
                <div className="text-base font-mono font-bold" style={{ color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Pane: Controls + Projections Charts */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Controllers */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-5 border border-border/5"
            style={{ background: "rgba(20,6,8,0.7)" }}
          >
            <div className="flex items-center gap-2 mb-4 font-mono text-[9px] font-bold text-primary border-b border-border/5 pb-2">
              <Sliders className="w-4 h-4 text-primary animate-pulse" /> DRAWDOWN CONSOLE
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-5">
              <div className="flex-1">
                <label className="text-[10px] font-mono tracking-widest text-muted-foreground block mb-2">
                  PROPOSED OUTFLOW RATE: <span className="text-primary font-bold">{drawdownRate} Mbpd</span>
                </label>
                <input
                  type="range" min="0" max="5" step="0.1"
                  value={drawdownRate}
                  onChange={(e) => setDrawdownRate(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <button
                onClick={handleOptimize}
                disabled={optimize.isPending}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-mono font-bold text-xs shadow-lg shadow-primary/10 transition-all hover:bg-primary-hover shrink-0 disabled:opacity-60"
              >
                {optimize.isPending ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : "OPTIMIZE DRAWDOWN"}
              </button>
            </div>

            {/* Calculations list */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "COVER DEPLETED IN", value: `${Math.max(0, Math.round(status.currentDays - drawdownRate * 10))} Days`, color: "#f59e0b" },
                { label: "VALUATION SHIFT", value: `+${(drawdownRate * 3.2).toFixed(1)}%`, color: "#ef4444" },
                { label: "SECURITY INDEX", value: drawdownRate > 3 ? "CRITICAL" : drawdownRate > 1.5 ? "NOMINAL" : "SAFE", color: "#22c55e" },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl border border-border/5 text-center"
                  style={{ background: "rgba(255,255,255,0.01)" }}>
                  <div className="text-[8px] font-mono tracking-widest text-muted-foreground">{item.label}</div>
                  <div className="text-xs font-mono font-bold text-white mt-1">{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 border border-border/5"
            style={{ background: "rgba(20,6,8,0.7)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                INVENTORY FORECAST DEPLETION
              </span>
              <div className="flex gap-3 text-[8px] font-mono">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> RESERVE LEVEL</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> SUPPLY GAP</span>
              </div>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={schedule}>
                  <defs>
                    <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(2 78% 57%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(2 78% 57%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" {...CHART_STYLE.axisStyle} />
                  <YAxis {...CHART_STYLE.axisStyle} domain={["auto", "auto"]} />
                  <Tooltip {...CHART_STYLE} />
                  <Area type="monotone" dataKey="reserveLevel" stroke="hsl(2 78% 57%)" strokeWidth={2.2} fillOpacity={1} fill="url(#resGrad)" name="Reserve Level" />
                  <Area type="monotone" dataKey="supplyGap" stroke="#ef4444" fill="none" strokeDasharray="5 5" strokeWidth={1.5} name="Supply Gap" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

      </div>

    </div>
  );
}
