import { useState } from "react";
import {
  useGetReserveStatus, getGetReserveStatusQueryKey,
  useGetDrawdownSchedule, getGetDrawdownScheduleQueryKey,
  useOptimizeReserve,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowRight, Droplets, TrendingDown } from "lucide-react";
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
  const mainGlow = isCritical ? "rgba(239,68,68,0.4)" : "rgba(217,64,52,0.4)";

  const handleOptimize = () => {
    optimize.mutate({ data: { scenarioId: "MANUAL", drawdownRateMbpd: drawdownRate } }, {
      onSuccess: () => toast({ title: "Reserve Re-optimized", description: "Drawdown schedule updated." }),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Reserve Optimizer</h2>
        <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
          STRATEGIC PETROLEUM RESERVE (SPR) LIFECYCLE MANAGEMENT
        </p>
      </div>

      {/* Action Banner */}
      {status.recommendedAction && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center justify-between gap-4"
          style={{
            background: isCritical ? "rgba(239,68,68,0.08)" : "rgba(217,64,52,0.08)",
            border: `1px solid ${isCritical ? "rgba(239,68,68,0.35)" : "rgba(217,64,52,0.3)"}`,
            boxShadow: `0 0 24px ${mainGlow}20`,
          }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: `${mainColor}15`, border: `1px solid ${mainColor}30` }}>
              <AlertTriangle className="w-5 h-5" style={{ color: mainColor }} />
            </div>
            <div>
              <div className="text-[9px] font-mono tracking-widest mb-0.5" style={{ color: mainColor, opacity: 0.8 }}>
                RECOMMENDED SYSTEM ACTION
              </div>
              <div className="font-bold text-white text-base font-display">
                {status.recommendedAction}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs shrink-0 transition-all"
            style={{
              background: `${mainColor}`,
              color: "white",
              boxShadow: `0 0 16px ${mainGlow}`,
            }}>
            EXECUTE <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── HERO GAUGE ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            background: "rgba(20,6,8,0.75)",
            border: `1px solid ${mainColor}25`,
            boxShadow: `0 0 40px ${mainGlow}18`,
          }}>

          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 30%, ${mainColor}08 0%, transparent 60%)` }} />

          <div className="text-[9px] font-mono tracking-[0.2em] mb-6 relative z-10"
            style={{ color: "hsl(355 8% 50%)" }}>
            DAYS OF COVER REMAINING
          </div>

          {/* SVG Gauge */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-4 z-10">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              {/* Track */}
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" strokeLinecap="round" />
              {/* Fill */}
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke={mainColor}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={circumference / 4}
                style={{ filter: `drop-shadow(0 0 6px ${mainGlow})`, transition: "stroke-dasharray 1s ease" }}
              />
              {/* Inner track faint */}
              <circle cx="60" cy="60" r="40" fill="none" stroke={`${mainColor}10`} strokeWidth="1.5" />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets className="w-5 h-5 mb-1" style={{ color: mainColor, opacity: 0.7 }} />
              <span className="text-5xl font-mono font-bold leading-none" style={{ color: mainColor, textShadow: `0 0 20px ${mainGlow}` }}>
                {status.currentDays}
              </span>
              <span className="text-[10px] font-mono mt-1" style={{ color: "hsl(355 8% 50%)" }}>
                / {status.capacityDays} MAX
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 w-full mt-2 z-10">
            {[
              { label: "FILL %", value: `${status.fillPercent}%`, color: mainColor },
              { label: "DRAWDOWN", value: `${status.drawdownRate} Mbpd`, color: "#f59e0b" },
            ].map(item => (
              <div key={item.label} className="text-center rounded-xl py-3 px-2"
                style={{ background: `${item.color}08`, border: `1px solid ${item.color}18` }}>
                <div className="text-[8px] font-mono tracking-widest mb-1" style={{ color: "hsl(355 8% 50%)" }}>
                  {item.label}
                </div>
                <div className="text-lg font-mono font-bold" style={{ color: item.color }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CHART + CONTROLS ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drawdown controller */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-5"
            style={{ background: "rgba(20,6,8,0.7)", border: "1px solid rgba(217,64,52,0.15)" }}>

            <h3 className="font-bold text-white mb-4">
              Drawdown Modeller
            </h3>

            <div className="flex items-end gap-5 mb-5">
              <div className="flex-1">
                <label className="text-[9px] font-mono tracking-widest block mb-2" style={{ color: "hsl(355 8% 55%)" }}>
                  PROPOSED RELEASE RATE:
                  <span className="ml-2" style={{ color: "hsl(2 78% 65%)" }}>{drawdownRate} Mbpd</span>
                </label>
                <div className="relative pt-1">
                  <input
                    type="range" min="0" max="5" step="0.1"
                    value={drawdownRate}
                    onChange={(e) => setDrawdownRate(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, hsl(2 78% 57%) ${drawdownRate * 20}%, rgba(217,64,52,0.2) ${drawdownRate * 20}%)`,
                    }}
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleOptimize}
                disabled={optimize.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs transition-all disabled:opacity-60"
                style={{
                  background: "rgba(217,64,52,0.12)",
                  border: "1px solid rgba(217,64,52,0.3)",
                  color: "hsl(2 78% 65%)",
                }}>
                {optimize.isPending ? "CALCULATING..." : "APPLY MODEL"}
              </motion.button>
            </div>

            {/* Quick stat row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "DAYS REMAINING", value: `${Math.max(0, Math.round(status.currentDays - drawdownRate * 10))}d`, icon: "⏱" },
                { label: "COST IMPACT", value: `+${(drawdownRate * 3.2).toFixed(1)}%`, icon: "📈" },
                { label: "SUPPLY BRIDGE", value: drawdownRate > 3 ? "HIGH" : drawdownRate > 1.5 ? "MED" : "LOW", icon: "🛡" },
              ].map(item => (
                <div key={item.label} className="rounded-xl px-3 py-2.5 text-center"
                  style={{ background: "rgba(217,64,52,0.05)", border: "1px solid rgba(217,64,52,0.1)" }}>
                  <div className="text-base mb-0.5">{item.icon}</div>
                  <div className="text-xs font-mono font-bold text-white">{item.value}</div>
                  <div className="text-[8px] font-mono mt-0.5" style={{ color: "hsl(355 8% 50%)" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-5"
            style={{ background: "rgba(20,6,8,0.7)", border: "1px solid rgba(217,64,52,0.15)" }}>

            <div className="flex items-center justify-between mb-4">
              <div className="text-[9px] font-mono tracking-widest" style={{ color: "hsl(355 8% 50%)" }}>
                PROJECTED INVENTORY LIFESPAN
              </div>
              <div className="flex items-center gap-3 text-[9px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 inline-block" style={{ background: "hsl(2 78% 57%)" }} />
                  <span style={{ color: "hsl(355 8% 55%)" }}>Reserve Level</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 inline-block border-dashed border-t border-[#ef4444]" style={{ borderStyle: "dashed" }} />
                  <span style={{ color: "hsl(355 8% 55%)" }}>Supply Gap</span>
                </span>
              </div>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={schedule}>
                  <defs>
                    <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(2 78% 57%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(2 78% 57%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" {...CHART_STYLE.axisStyle} />
                  <YAxis {...CHART_STYLE.axisStyle} domain={["auto", "auto"]} />
                  <Tooltip {...CHART_STYLE} />
                  <Area type="monotone" dataKey="reserveLevel" stroke="hsl(2 78% 57%)" strokeWidth={2.5} fillOpacity={1} fill="url(#resGrad)" />
                  <Area type="monotone" dataKey="supplyGap" stroke="#ef4444" fill="none" strokeDasharray="5 5" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
