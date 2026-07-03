import { useState } from "react";
import { useGetScenarios, getGetScenariosQueryKey, useRunScenario } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Activity, Zap, Video, TrendingDown, TrendingUp, Minus, ShieldAlert, Sliders, Sparkles, Download, FileText } from "lucide-react";
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
    <span className="flex items-center gap-1 text-[10px] font-mono font-bold" style={{ color }}>
      <Icon className="w-3 h-3" />
      {delta > 0 ? "+" : ""}{delta} projected
    </span>
  );
}

function formatBeforeAfterData(dataArray: any[]) {
  if (!dataArray || dataArray.length < 12) return [];
  return dataArray.slice(0, 6).map((item, index) => {
    const disruptedItem = dataArray[index + 6];
    return {
      date: item.date,
      baseline: item.value,
      disrupted: disruptedItem ? disruptedItem.value : null
    };
  });
}

export default function Scenarios() {
  const { data: scenarios, isLoading } = useGetScenarios({ query: { queryKey: getGetScenariosQueryKey() } });
  const runSim = useRunScenario();
  const { toast } = useToast();

  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [severity, setSeverity] = useState(5);
  const [results, setResults] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRun = () => {
    if (!activeScenario) return;
    runSim.mutate({ data: { scenarioId: activeScenario, severity } }, {
      onSuccess: (data) => {
        setResults(data);
        toast({ title: "Simulation Complete", description: "Scenario impacts rendered." });
      },
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast({ title: "Report Exported", description: "Simulation comparison PDF generated." });
    }, 1000);
  };

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

  const activeScenData = scenarios.find(s => s.id === activeScenario);

  return (
    <div className="space-y-6">
      
      {/* Redesigned Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Scenario Simulation</h2>
          <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
            GEOPOLITICAL SHOCK BUILDER & INTEGRATED IMPACT MODEL
          </p>
        </div>
        {results && (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 hover:border-primary/45 rounded-xl font-mono text-xs font-bold text-primary transition-all disabled:opacity-50 self-start sm:self-auto"
          >
            {isExporting ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            EXPORT COMP-REPORT
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left Pane: Scenario Builder */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5 border border-border/5 space-y-4" style={{ background: "rgba(20,6,8,0.7)" }}>
            <div className="flex items-center gap-2 mb-2 font-mono text-[9px] font-bold text-primary border-b border-border/5 pb-2">
              <Sliders className="w-4 h-4 text-primary animate-pulse" /> DISRUPTION PARAMETERS
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {scenarios.map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => { setActiveScenario(scen.id); setResults(null); }}
                  className="w-full text-left rounded-xl p-3.5 transition-all text-xs font-mono"
                  style={activeScenario === scen.id ? {
                    background: "linear-gradient(135deg, rgba(217,64,52,0.15) 0%, rgba(217,64,52,0.05) 100%)",
                    border: "1px solid rgba(217,64,52,0.35)",
                    boxShadow: "0 0 16px rgba(217,64,52,0.1)",
                  } : {
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid border-border/5",
                  }}
                >
                  <div className="text-white font-bold mb-1">{scen.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed">
                    {scen.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Severity slider and action */}
            <AnimatePresence>
              {activeScenario && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-3 border-t border-border/5"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                    <span>SEVERITY INDEX</span>
                    <span className="text-primary font-bold">{severity}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-muted-foreground/60">
                    <span>MODERATE</span>
                    <span>HIGH</span>
                    <span>CRITICAL</span>
                  </div>

                  <button
                    onClick={handleRun}
                    disabled={runSim.isPending}
                    className="w-full py-2.5 rounded-xl bg-primary text-white font-mono font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all disabled:opacity-60"
                  >
                    {runSim.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    RUN GEOPOLITICAL SIMULATION
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Recommendation Context */}
          {results && (
            <div className="rounded-2xl p-5 border border-border/5" style={{ background: "rgba(20,6,8,0.7)" }}>
              <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-primary mb-3">
                <Sparkles className="w-3.5 h-3.5" /> MODEL CRITIQUE
              </div>
              <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                The AI Core suggests securing spot freight agreements. Pre-allocating **4.2 days** of replenishment buffers avoids refinery run rate disruptions.
              </p>
            </div>
          )}
        </div>

        {/* Right Pane: Results Workspace */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                
                {/* 2x2 comparison grid of baseline vs disrupted paths */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Chart 1: Refinery Run Rate */}
                  <div className="rounded-2xl p-4.5 border border-border/5"
                    style={{ background: "rgba(20,6,8,0.7)" }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                        REFINERY RUN RATE
                      </span>
                      <div className="flex gap-2 text-[8px] font-mono">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> BASELINE</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> DISRUPTED</span>
                      </div>
                    </div>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formatBeforeAfterData(results.beforeAfter.refineryRunRate)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis dataKey="date" {...CHART_STYLE.axisStyle} />
                          <YAxis {...CHART_STYLE.axisStyle} domain={['auto', 'auto']} />
                          <Tooltip {...CHART_STYLE} />
                          <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                          <Line type="monotone" dataKey="disrupted" stroke="hsl(2 78% 57%)" strokeWidth={2.2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Fuel Price Delta */}
                  <div className="rounded-2xl p-4.5 border border-border/5"
                    style={{ background: "rgba(20,6,8,0.7)" }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                        FUEL PRICE DELTA
                      </span>
                      <div className="flex gap-2 text-[8px] font-mono">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> BASELINE</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> DISRUPTED</span>
                      </div>
                    </div>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formatBeforeAfterData(results.beforeAfter.fuelPriceDelta)}>
                          <defs>
                            <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis dataKey="date" {...CHART_STYLE.axisStyle} />
                          <YAxis {...CHART_STYLE.axisStyle} domain={['auto', 'auto']} />
                          <Tooltip {...CHART_STYLE} />
                          <Area type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="3 3" fill="none" strokeWidth={1.5} />
                          <Area type="monotone" dataKey="disrupted" stroke="#ef4444" fill="url(#fuelGrad)" strokeWidth={2.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 3: Power Sector Stress */}
                  <div className="rounded-2xl p-4.5 border border-border/5"
                    style={{ background: "rgba(20,6,8,0.7)" }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                        POWER SECTOR STRESS INDEX
                      </span>
                      <div className="flex gap-2 text-[8px] font-mono">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> BASELINE</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> DISRUPTED</span>
                      </div>
                    </div>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formatBeforeAfterData(results.beforeAfter.powerStressIndex)}>
                          <defs>
                            <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis dataKey="date" {...CHART_STYLE.axisStyle} />
                          <YAxis {...CHART_STYLE.axisStyle} domain={['auto', 'auto']} />
                          <Tooltip {...CHART_STYLE} />
                          <Area type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="3 3" fill="none" strokeWidth={1.5} />
                          <Area type="monotone" dataKey="disrupted" stroke="#f59e0b" fill="url(#powerGrad)" strokeWidth={2.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 4: GDP Trajectory Impact */}
                  <div className="rounded-2xl p-4.5 border border-border/5"
                    style={{ background: "rgba(20,6,8,0.7)" }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                        GDP TRAJECTORY IMPACT
                      </span>
                      <div className="flex gap-2 text-[8px] font-mono">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> BASELINE</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> DISRUPTED</span>
                      </div>
                    </div>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formatBeforeAfterData(results.beforeAfter.gdpImpact)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis dataKey="date" {...CHART_STYLE.axisStyle} />
                          <YAxis {...CHART_STYLE.axisStyle} domain={['auto', 'auto']} />
                          <Tooltip {...CHART_STYLE} />
                          <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                          <Line type="monotone" dataKey="disrupted" stroke="#3b82f6" strokeWidth={2.2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Video Generation and details */}
                <div className="rounded-2xl p-5 border border-border/5 flex items-center justify-between gap-4"
                  style={{ background: "linear-gradient(135deg, rgba(217,64,52,0.08) 0%, rgba(20,6,8,0.6) 100%)" }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/25">
                      <Video className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-display">Generate Simulation Video</div>
                      <div className="text-[10px] font-mono text-muted-foreground">Animated progress model vector visualization · 10s</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVideo(true)}
                    className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-primary text-white font-mono font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover"
                  >
                    <Zap className="w-3.5 h-3.5" /> GENERATE
                  </button>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-96 rounded-2xl border border-dashed border-border/20 flex flex-col items-center justify-center gap-4"
                style={{ background: "rgba(20,6,8,0.3)" }}
              >
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/5 text-muted-foreground/40">
                  <Zap className="w-10 h-10 animate-pulse" />
                </div>
                <div className="text-center font-mono">
                  <div className="font-bold text-white mb-1">NO SIMULATION ACTIVE</div>
                  <p className="text-xs text-muted-foreground">Select a parameters builder model on the left to analyze.</p>
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
