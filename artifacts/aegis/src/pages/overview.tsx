import { useState, useEffect } from "react";
import { useGetOverviewSummary, getGetOverviewSummaryQueryKey, useRunFullSimulation } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Zap, TrendingUp, TrendingDown, Minus, AlertOctagon, CheckCircle, AlertTriangle, ShieldAlert, Cpu, Sparkles, MapPin, Radio, Compass, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const stateConfig = {
  NOMINAL: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.2)",
    glow: "rgba(34,197,94,0.3)",
    Icon: CheckCircle,
    label: "ALL SYSTEMS NOMINAL",
  },
  ELEVATED: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.2)",
    glow: "rgba(245,158,11,0.3)",
    Icon: AlertTriangle,
    label: "ELEVATED RISK — MONITOR",
  },
  CRITICAL: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.2)",
    glow: "rgba(239,68,68,0.3)",
    Icon: AlertOctagon,
    label: "CRITICAL — IMMEDIATE ACTION",
  },
};

const MODULE_GRADIENT_IDS = ["ov0","ov1","ov2","ov3","ov4"];

export default function Overview() {
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    "Risk Intelligence": true,
    "Scenario Modeller": true,
    "Procurement": true,
    "Reserve Optimizer": true,
    "Digital Twin": true
  });

  useEffect(() => {
    const prefs = localStorage.getItem("aegis_layout_preferences");
    if (prefs) {
      try {
        setEnabledModules(JSON.parse(prefs));
      } catch (e) {}
    }
  }, []);

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
      
      {/* ── HERO MISSION CONTROL SUMMARY ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* State Banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: `0 0 30px ${cfg.glow}` }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{ background: `radial-gradient(circle at 80% 20%, ${cfg.glow} 0%, transparent 60%)`, opacity: 0.3 }} />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3.5 rounded-xl shrink-0" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
              <StateIcon className="w-6 h-6 animate-pulse" style={{ color: cfg.color }} />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-muted-foreground">COMMAND STATE</div>
              <h2 className="text-xl font-bold tracking-wider text-white mt-1">{cfg.label}</h2>
              <p className="text-xs font-mono text-slate-400 mt-2 max-w-xl">
                National supply buffer diagnostics normal. The AI commander detects no immediate tanker blocks along standard maritime corridors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-border/5 mt-4">
            <div className="text-center">
              <div className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Global Risk</div>
              <div className="text-xl font-mono font-bold text-white mt-1">{summary.riskScore.toFixed(1)}</div>
            </div>
            <div className="w-px h-8 bg-border/10" />
            <div className="text-center">
              <div className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">SPR Buffer</div>
              <div className="text-xl font-mono font-bold text-white mt-1">{summary.reserveDays} Days</div>
            </div>
            <div className="w-px h-8 bg-border/10" />
            <div className="text-center">
              <div className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Last Sync</div>
              <div className="text-xs font-mono font-bold text-white mt-2">
                {new Date(summary.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSimulate}
              disabled={simulate.isPending}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-primary text-white shadow-lg shadow-primary/20 transition-all shrink-0 disabled:opacity-50"
            >
              {simulate.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              LAUNCH GLOBAL DISRUPTION SIM
            </motion.button>
          </div>
        </motion.div>

        {/* AI Briefing Box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 border border-border/5 relative overflow-hidden flex flex-col justify-between"
          style={{ background: "rgba(20,6,8,0.7)" }}
        >
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> INTEL SUMMARY
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug">
              Strategic Reserve coverage remains secure for the next 45 days.
            </h3>
            <p className="text-xs text-muted-foreground mt-2 font-mono leading-relaxed">
              Geopolitical indicators highlight elevated tensions in the Gulf of Aden route. Sourcing alternatives are recommended for Chennai refinery hubs.
            </p>
          </div>
          <div className="pt-4 border-t border-border/5 mt-4 flex items-center justify-between text-[8px] font-mono">
            <span>MODEL CONFIDENCE: 92%</span>
            <Link href="/ai-command" className="text-primary hover:underline flex items-center gap-1">
              ASK AI CONSOLE →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── WORKSPACE CARD LAYOUT ───────────────────────────────── */}
      <div className="space-y-3">
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground">ACTIVE WORKSPACE CORE KPI MODULES</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {summary.moduleSummaries
            .filter(mod => enabledModules[mod.module] !== false)
            .map((mod, idx) => {
              const TrendIcon = mod.trend === "up" ? TrendingUp : mod.trend === "down" ? TrendingDown : Minus;
              const trendColor = mod.trend === "up" ? "#ef4444" : mod.trend === "down" ? "#22c55e" : "hsl(355 8% 50%)";
              const gradId = MODULE_GRADIENT_IDS[idx] ?? `ov${idx}`;

              return (
                <motion.div
                  key={mod.module}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl p-4.5 border border-border/5 relative overflow-hidden flex flex-col justify-between card-shine"
                  style={{ background: "rgba(20,6,8,0.7)" }}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">{mod.module}</span>
                      <span className="flex items-center gap-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${trendColor}10`, color: trendColor, border: `1px solid ${trendColor}25` }}>
                        <TrendIcon className="w-2.5 h-2.5" />
                        {mod.trend?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white leading-normal min-h-[2.5rem]">
                      {mod.headline}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-mono font-bold text-primary">{mod.value}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{mod.unit}</span>
                    </div>

                    <div className="h-10 -mx-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mod.sparkline.map((v, i) => ({ val: v, i }))}>
                          <defs>
                            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(2 78% 57%)" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="hsl(2 78% 57%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="val"
                            stroke="hsl(2 78% 57%)"
                            fill={`url(#${gradId})`}
                            strokeWidth={1.5}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* ── CORE OPERATIONS MONITOR ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Active simulations widget */}
        <div className="lg:col-span-2 rounded-2xl p-5 border border-border/5 flex flex-col justify-between"
          style={{ background: "rgba(20,6,8,0.7)" }}>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '6s' }} /> Active Disruption Models
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono mb-4">
              Real-time monitoring of potential geopolitical disruptions simulated by the system.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { name: "Strait of Hormuz Blockage", route: "Gulf Corridor", impact: "High", gdp: "-0.22%", status: "Active Disruption Model" },
              { name: "OPEC Production Adjustment", route: "Supply Pipeline", impact: "Moderate", gdp: "-0.15%", status: "Historical Comparison" },
              { name: "Suez Cape Route Rerouting", route: "Red Sea Transit", impact: "High", gdp: "-0.10%", status: "Simulation Ready" },
            ].map(sim => (
              <div key={sim.name} className="flex items-center justify-between p-3.5 rounded-xl border border-border/5"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div>
                  <div className="text-xs font-bold text-white">{sim.name}</div>
                  <div className="text-[9px] font-mono text-muted-foreground mt-1">{sim.route}</div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-primary">{sim.gdp} GDP Impact</span>
                    <div className="text-[8px] font-mono text-muted-foreground mt-0.5">{sim.status}</div>
                  </div>
                  <Link href="/scenarios" className="p-1.5 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20">
                    <Zap className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upcoming Geopolitical Risks Feed */}
        <div className="rounded-2xl p-5 border border-border/5 flex flex-col"
          style={{ background: "rgba(20,6,8,0.7)" }}>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-primary animate-pulse" /> Command Center Timeline
          </h3>
          <p className="text-[10px] text-muted-foreground font-mono mb-4">
            Recent activity logs and geopolitical warnings list.
          </p>

          <div className="flex-1 space-y-4 overflow-y-auto">
            {[
              { msg: "Strait of Hormuz threat calculation index completed.", time: "4m ago", type: "success" },
              { msg: "API Gateway database sync cache refreshed successfully.", time: "15m ago", type: "info" },
              { msg: "Warning: High latency detected along Cape routes.", time: "42m ago", type: "warning" },
              { msg: "Disruption simulation run initiated for Indian Ocean.", time: "1h ago", type: "info" },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 text-xs leading-normal">
                <span className="mt-1 shrink-0 w-2 h-2 rounded-full"
                  style={{ background: log.type === 'success' ? '#22c55e' : log.type === 'warning' ? '#ef4444' : '#3b82f6' }} />
                <div>
                  <div className="text-slate-200 text-[11px] font-mono">{log.msg}</div>
                  <span className="text-[8px] font-mono text-muted-foreground block mt-1">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
