import { useState } from "react";
import { useGetScenarios, getGetScenariosQueryKey, useRunScenario } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Activity, Zap, Video, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { ScenarioVideoModal } from "@/components/scenario-video";

const CHART_STYLE = {
  contentStyle: {
    background: "hsl(355 28% 8%)",
    border: "1px solid rgba(217,64,52,0.25)",
    borderRadius: "8px",
    fontSize: "11px",
    fontFamily: "DM Mono, monospace",
  },
  axisStyle: { stroke: "rgba(255,255,255,0.15)", fontSize: 10, fontFamily: "DM Mono, monospace" },
};

function DeltaBadge({ delta, direction }: { delta: number; direction: string }) {
  const color = direction === "down" ? "#ef4444" : direction === "up" ? "#f59e0b" : "#22c55e";
  const Icon = direction === "down" ? TrendingDown : direction === "up" ? TrendingUp : Minus;
  return (
    <span className="flex items-center gap-1 text-xs font-mono font-bold" style={{ color }}>
      <Icon className="w-3 h-3" />
      {delta > 0 ? "+" : ""}{delta} projected
    </span>
  );
}

export default function Scenarios() {
  const { data: scenarios, isLoading } = useGetScenarios({ query: { queryKey: getGetScenariosQueryKey() } });
  const runSim = useRunScenario();
  const { toast } = useToast();

  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [severity, setSeverity] = useState(5);
  const [results, setResults] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);

  if (isLoading || !scenarios) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-xl" style={{ background: "rgba(217,64,52,0.08)" }} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Skeleton className="h-[500px] rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
          <Skeleton className="h-[500px] rounded-2xl col-span-3" style={{ background: "rgba(217,64,52,0.08)" }} />
        </div>
      </div>
    );
  }

  const handleRun = () => {
    if (!activeScenario) return;
    runSim.mutate({ data: { scenarioId: activeScenario, severity } }, {
      onSuccess: (data) => {
        setResults(data);
        toast({ title: "Simulation Complete", description: "Scenario impacts rendered." });
      },
    });
  };

  const activeScenData = scenarios.find(s => s.id === activeScenario);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Scenario Modeller</h2>
        <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
          SIMULATE GEOPOLITICAL SHOCKS & EVALUATE CASCADING IMPACTS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* ── SCENARIO SELECTION ──────────────────────────────── */}
        <div className="space-y-2.5">
          <div className="text-[9px] font-mono tracking-[0.2em] mb-3" style={{ color: "hsl(355 8% 50%)" }}>
            SELECT SCENARIO
          </div>

          {scenarios.map((scen, i) => (
            <motion.button
              key={scen.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveScenario(scen.id); setResults(null); }}
              className="w-full text-left rounded-xl p-4 transition-all duration-200"
              style={activeScenario === scen.id ? {
                background: "linear-gradient(135deg, rgba(217,64,52,0.18) 0%, rgba(217,64,52,0.08) 100%)",
                border: "1px solid rgba(217,64,52,0.4)",
                boxShadow: "0 0 20px rgba(217,64,52,0.12)",
              } : {
                background: "rgba(20,6,8,0.65)",
                border: "1px solid rgba(217,64,52,0.12)",
              }}>
              {activeScenario === scen.id && (
                <div className="w-full h-0.5 mb-3 rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(2 78% 57%), transparent)" }} />
              )}
              <div className="text-xs font-bold text-white mb-1">{scen.name}</div>
              <div className="text-[10px] leading-relaxed" style={{ color: "hsl(355 8% 55%)" }}>
                {scen.description}
              </div>
            </motion.button>
          ))}

          {/* Severity & Execute */}
          <AnimatePresence>
            {activeScenario && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl p-4 mt-2"
                style={{ background: "rgba(217,64,52,0.06)", border: "1px solid rgba(217,64,52,0.2)" }}>

                <label className="text-[9px] font-mono tracking-widest block mb-2"
                  style={{ color: "hsl(355 8% 55%)" }}>
                  SEVERITY: <span style={{ color: "hsl(2 78% 65%)" }}>{severity}/10</span>
                </label>

                <div className="relative mb-4">
                  <input
                    type="range" min="1" max="10"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(90deg, hsl(2 78% 57%) ${severity * 10}%, rgba(217,64,52,0.2) ${severity * 10}%)` }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleRun}
                  disabled={runSim.isPending}
                  className="w-full py-2.5 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, hsl(2 78% 57%) 0%, hsl(355 75% 45%) 100%)",
                    color: "white",
                    boxShadow: "0 0 16px rgba(217,64,52,0.3)",
                  }}>
                  {runSim.isPending
                    ? <Activity className="w-3.5 h-3.5 animate-spin" />
                    : <Play className="w-3.5 h-3.5" />}
                  EXECUTE SIMULATION
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RESULTS PANEL ───────────────────────────────────── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                {/* Impact metric cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {results.impacts.map((impact: any, i: number) => {
                    const color = impact.direction === "down" ? "#ef4444" : impact.direction === "up" ? "#f59e0b" : "#22c55e";
                    return (
                      <motion.div
                        key={impact.metric}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="rounded-xl p-4 relative overflow-hidden"
                        style={{
                          background: "rgba(20,6,8,0.7)",
                          border: `1px solid ${color}20`,
                          borderTop: `2px solid ${color}`,
                        }}>
                        <div className="text-[9px] font-mono tracking-widest mb-2" style={{ color: "hsl(355 8% 50%)" }}>
                          {impact.metric}
                        </div>
                        <div className="text-2xl font-mono font-bold text-white mb-1">
                          {impact.after}
                          <span className="text-xs ml-1" style={{ color: "hsl(355 8% 50%)" }}>{impact.unit}</span>
                        </div>
                        <DeltaBadge delta={impact.delta} direction={impact.direction} />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5"
                    style={{ background: "rgba(20,6,8,0.7)", border: "1px solid rgba(217,64,52,0.15)" }}>
                    <div className="text-[9px] font-mono tracking-widest mb-4" style={{ color: "hsl(355 8% 50%)" }}>
                      REFINERY RUN RATE
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={results.beforeAfter.refineryRunRate}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="date" {...CHART_STYLE.axisStyle} />
                          <YAxis {...CHART_STYLE.axisStyle} />
                          <Tooltip {...CHART_STYLE} />
                          <Line type="monotone" dataKey="value" stroke="hsl(2 78% 57%)" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl p-5"
                    style={{ background: "rgba(20,6,8,0.7)", border: "1px solid rgba(217,64,52,0.15)" }}>
                    <div className="text-[9px] font-mono tracking-widest mb-4" style={{ color: "hsl(355 8% 50%)" }}>
                      FUEL PRICE DELTA
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results.beforeAfter.fuelPriceDelta}>
                          <defs>
                            <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="date" {...CHART_STYLE.axisStyle} />
                          <YAxis {...CHART_STYLE.axisStyle} />
                          <Tooltip {...CHART_STYLE} />
                          <Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#fuelGrad)" strokeWidth={2.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Video Generation CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-5 flex items-center justify-between gap-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(217,64,52,0.08) 0%, rgba(20,6,8,0.6) 100%)",
                    border: "1px solid rgba(217,64,52,0.2)",
                  }}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl" style={{ background: "rgba(217,64,52,0.15)", border: "1px solid rgba(217,64,52,0.3)" }}>
                      <Video className="w-5 h-5" style={{ color: "hsl(2 78% 65%)" }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white mb-0.5 font-display">
                        Generate Simulation Video
                      </div>
                      <div className="text-[10px] font-mono" style={{ color: "hsl(355 8% 55%)" }}>
                        AI-rendered animated visualization of the {activeScenData?.name} scenario progression · 10s WEBM
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setShowVideo(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs shrink-0 transition-all"
                    style={{
                      background: "linear-gradient(135deg, hsl(2 78% 57%) 0%, hsl(355 75% 45%) 100%)",
                      color: "white",
                      boxShadow: "0 0 16px rgba(217,64,52,0.25)",
                    }}>
                    <Zap className="w-3.5 h-3.5" />
                    GENERATE VIDEO
                  </motion.button>
                </motion.div>

              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-96 rounded-2xl flex flex-col items-center justify-center gap-4"
                style={{ background: "rgba(20,6,8,0.5)", border: "2px dashed rgba(217,64,52,0.15)" }}>
                <div className="p-4 rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }}>
                  <Zap className="w-10 h-10" style={{ color: "rgba(217,64,52,0.4)" }} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white mb-1 font-display">
                    No Simulation Active
                  </div>
                  <p className="text-sm font-mono" style={{ color: "hsl(355 8% 50%)" }}>
                    Select a scenario and execute simulation to view impact analysis
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {showVideo && results && (
          <ScenarioVideoModal
            scenarioName={activeScenData?.name ?? "Scenario"}
            scenarioId={activeScenario ?? ""}
            impacts={results.impacts}
            onClose={() => setShowVideo(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
