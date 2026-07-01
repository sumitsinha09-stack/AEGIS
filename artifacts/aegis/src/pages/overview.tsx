import { useGetOverviewSummary, getGetOverviewSummaryQueryKey, useRunFullSimulation } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Zap, TrendingUp, TrendingDown, Minus, AlertOctagon, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const stateConfig = {
  NOMINAL: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.25)",
    glow: "rgba(34,197,94,0.4)",
    Icon: CheckCircle,
    label: "ALL SYSTEMS NOMINAL",
  },
  ELEVATED: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    glow: "rgba(245,158,11,0.4)",
    Icon: AlertTriangle,
    label: "ELEVATED RISK — MONITOR",
  },
  CRITICAL: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    glow: "rgba(239,68,68,0.4)",
    Icon: AlertOctagon,
    label: "CRITICAL — IMMEDIATE ACTION",
  },
};

const MODULE_GRADIENT_IDS = ["ov0","ov1","ov2","ov3","ov4"];

export default function Overview() {
  const { data: summary, isLoading } = useGetOverviewSummary({
    query: { queryKey: getGetOverviewSummaryQueryKey() }
  });
  const { toast } = useToast();
  const simulate = useRunFullSimulation();

  const handleSimulate = () => {
    simulate.mutate({ data: { scenarioId: "GLOBAL_SHOCK", severity: 8 } }, {
      onSuccess: () => {
        toast({ title: "Simulation complete", description: "Global shock scenario rendered successfully." });
      },
    });
  };

  if (isLoading || !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-40 w-full rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
          ))}
        </div>
      </div>
    );
  }

  const cfg = stateConfig[summary.systemState as keyof typeof stateConfig] ?? stateConfig.NOMINAL;
  const StateIcon = cfg.Icon;

  return (
    <div className="space-y-6">
      {/* ── HERO STATUS BANNER ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-6 md:p-8"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: `0 0 40px ${cfg.glow}` }}>

        {/* Animated corner glow */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: `radial-gradient(circle at 80% 20%, ${cfg.glow} 0%, transparent 60%)`, opacity: 0.4 }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-3 rounded-xl" style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}>
              <StateIcon className="w-7 h-7" style={{ color: cfg.color }} />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] mb-1" style={{ color: "hsl(355 8% 55%)" }}>
                SYSTEM STATE
              </div>
              <div className="text-4xl md:text-5xl font-bold leading-none font-display" style={{ color: cfg.color, textShadow: `0 0 30px ${cfg.glow}` }}>
                {summary.systemState}
              </div>
              <div className="text-xs font-mono mt-1.5 tracking-wider" style={{ color: cfg.color, opacity: 0.8 }}>
                {cfg.label}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            <div className="text-center">
              <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: "hsl(355 8% 55%)" }}>GLOBAL RISK</div>
              <div className="text-3xl font-mono font-bold text-white">{summary.riskScore.toFixed(1)}</div>
              <div className="text-[10px] font-mono" style={{ color: "hsl(355 8% 50%)" }}>/100</div>
            </div>
            <div className="w-px h-12" style={{ background: "rgba(217,64,52,0.2)" }} />
            <div className="text-center">
              <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: "hsl(355 8% 55%)" }}>SPR COVER</div>
              <div className="text-3xl font-mono font-bold text-white">{summary.reserveDays}</div>
              <div className="text-[10px] font-mono" style={{ color: "hsl(355 8% 50%)" }}>DAYS</div>
            </div>
            <div className="w-px h-12" style={{ background: "rgba(217,64,52,0.2)" }} />
            <div className="text-center">
              <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: "hsl(355 8% 55%)" }}>UPDATED</div>
              <div className="text-sm font-mono font-bold text-white">
                {new Date(summary.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="text-[10px] font-mono" style={{ color: "hsl(355 8% 50%)" }}>LOCAL</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSimulate}
            disabled={simulate.isPending}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-mono font-bold text-sm transition-all disabled:opacity-60 shrink-0"
            style={{
              background: "linear-gradient(135deg, hsl(2 78% 57%) 0%, hsl(355 75% 45%) 100%)",
              color: "white",
              boxShadow: "0 0 24px rgba(217,64,52,0.35)",
            }}>
            {simulate.isPending
              ? <Activity className="w-4 h-4 animate-spin" />
              : <Zap className="w-4 h-4" />}
            RUN DISRUPTION SIM
          </motion.button>
        </div>
      </motion.div>

      {/* ── MODULE CARDS GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {summary.moduleSummaries.map((mod, idx) => {
          const TrendIcon = mod.trend === "up" ? TrendingUp : mod.trend === "down" ? TrendingDown : Minus;
          const trendColor = mod.trend === "up" ? "#ef4444" : mod.trend === "down" ? "#22c55e" : "hsl(355 8% 50%)";
          const gradId = MODULE_GRADIENT_IDS[idx] ?? `ov${idx}`;

          return (
            <motion.div
              key={mod.module}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.07 }}
              whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(217,64,52,0.15)" }}
              className="relative rounded-2xl p-5 flex flex-col overflow-hidden card-shine"
              style={{
                background: "rgba(20,6,8,0.7)",
                border: "1px solid rgba(217,64,52,0.15)",
                backdropFilter: "blur(12px)",
              }}>

              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-[9px] font-mono tracking-[0.18em] leading-relaxed"
                  style={{ color: "hsl(355 8% 52%)" }}>
                  {mod.module.replace(/ /g, "\n")}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-mono font-bold"
                  style={{ background: `${trendColor}15`, border: `1px solid ${trendColor}30`, color: trendColor }}>
                  <TrendIcon className="w-2.5 h-2.5" />
                  {mod.trend?.toUpperCase()}
                </div>
              </div>

              {/* Headline */}
              <div className="text-xs font-medium leading-snug mb-3 flex-1"
                style={{ color: "hsl(0 0% 75%)", minHeight: "2.4rem" }}>
                {mod.headline}
              </div>

              {/* Value */}
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-3xl font-bold font-mono" style={{ color: "hsl(2 78% 65%)" }}>
                  {mod.value}
                </span>
                <span className="text-xs font-mono" style={{ color: "hsl(355 8% 50%)" }}>{mod.unit}</span>
              </div>

              {/* Sparkline */}
              <div className="h-14 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mod.sparkline.map((v, i) => ({ val: v, i }))}>
                    <defs>
                      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(2 78% 57%)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(2 78% 57%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke="hsl(2 78% 57%)"
                      fill={`url(#${gradId})`}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl"
                style={{ background: "linear-gradient(90deg, transparent, hsl(2 78% 57%), transparent)" }} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
