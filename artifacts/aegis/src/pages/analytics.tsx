import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Calendar, Download, FileText, Filter, RefreshCw, BarChart2, TrendingUp, DollarSign, Clock, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const historicalRiskData = [
  { month: "Jan", Hormuz: 45, Malacca: 30, Suez: 25, Cape: 15 },
  { month: "Feb", Hormuz: 48, Malacca: 32, Suez: 28, Cape: 15 },
  { month: "Mar", Hormuz: 62, Malacca: 35, Suez: 45, Cape: 18 },
  { month: "Apr", Hormuz: 74, Malacca: 42, Suez: 50, Cape: 20 },
  { month: "May", Hormuz: 70, Malacca: 40, Suez: 48, Cape: 22 },
  { month: "Jun", Hormuz: 75, Malacca: 45, Suez: 52, Cape: 25 },
];

const efficiencyData = [
  { route: "Strait of Hormuz", normal: 95, current: 88, projected: 82 },
  { route: "Red Sea Route", normal: 90, current: 40, projected: 35 },
  { route: "Suez Canal Transit", normal: 92, current: 70, projected: 65 },
  { route: "Cape Route (Reroute)", normal: 60, current: 55, projected: 55 },
  { route: "Strait of Malacca", normal: 98, current: 95, projected: 92 },
];

const supplyCostData = [
  { name: "Reliance Ind.", cost: 82, quality: 90, reliability: 88, risk: 40 },
  { name: "Indian Oil Corp", cost: 78, quality: 85, reliability: 92, risk: 45 },
  { name: "Saudi Aramco", cost: 95, quality: 98, reliability: 99, risk: 25 },
  { name: "Rosneft Trading", cost: 68, quality: 88, reliability: 72, risk: 80 },
  { name: "ADNOC Group", cost: 90, quality: 96, reliability: 97, risk: 30 },
];

export default function Analytics() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("6m");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: "csv" | "pdf") => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Report Exported",
        description: `AEGIS System Executive Analytics report generated as ${format.toUpperCase()}.`,
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
          <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
            PREDICTIVE GEOPOLITICAL TRENDS & OPERATIONAL METRICS
          </p>
        </div>

        {/* Filter and export actions */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex bg-muted/30 border border-border/10 p-0.5 rounded-xl text-xs font-mono">
            {["1m", "6m", "1y"].map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === r ? "bg-primary text-white font-bold" : "text-muted-foreground"}`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative group">
            <button
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 hover:border-primary/45 rounded-xl font-mono text-xs font-bold text-primary transition-all disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              EXPORT REPORT
            </button>
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-popover border border-border/10 rounded-xl overflow-hidden shadow-2xl z-50 text-xs font-mono">
              <button onClick={() => handleExport("csv")} className="w-full text-left px-4 py-2.5 hover:bg-muted/40 text-white flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" /> Export to CSV
              </button>
              <button onClick={() => handleExport("pdf")} className="w-full text-left px-4 py-2.5 hover:bg-muted/40 text-white flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-primary" /> Export to PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "OVERALL GEO-RISK INDEX", value: "62.4", delta: "+18.2%", icon: ShieldAlert, color: "#ef4444" },
          { label: "TOTAL CRUDE PROCUREMENT", value: "$4.12B", delta: "-2.4%", icon: DollarSign, color: "#22c55e" },
          { label: "TRANSIT LATENCY OVERALL", value: "+4.2d", delta: "+1.2d", icon: Clock, color: "#f59e0b" },
          { label: "SUPPLIER TRUST SCORE", value: "88.6%", delta: "+1.5%", icon: TrendingUp, color: "#3b82f6" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-5 border border-border/5 relative overflow-hidden card-shine"
            style={{ background: "rgba(20,6,8,0.7)", borderLeft: `3px solid ${kpi.color}` }}
          >
            <div className="text-[9px] font-mono tracking-widest text-muted-foreground mb-2">{kpi.label}</div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-mono font-bold text-white">{kpi.value}</div>
              <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${kpi.color}15`, color: kpi.color }}>
                {kpi.delta}
              </div>
            </div>
            <kpi.icon className="absolute right-4 top-4 w-10 h-10 opacity-5 pointer-events-none" style={{ color: kpi.color }} />
          </motion.div>
        ))}
      </div>

      {/* Primary Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Risk Trend Timeline */}
        <div className="lg:col-span-2 rounded-2xl p-5 border border-border/5"
          style={{ background: "rgba(20,6,8,0.7)" }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-semibold text-white">Geopolitical Risk Evolution</h4>
              <p className="text-[10px] text-muted-foreground font-mono">Comparative threat trend for critical energy corridors.</p>
            </div>
            <div className="flex gap-3 text-[9px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Hormuz</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Suez</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Malacca</span>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalRiskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" {...CHART_STYLE.axisStyle} />
                <YAxis {...CHART_STYLE.axisStyle} />
                <Tooltip {...CHART_STYLE} />
                <Line type="monotone" dataKey="Hormuz" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Suez" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Malacca" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route Efficiency comparisons */}
        <div className="rounded-2xl p-5 border border-border/5"
          style={{ background: "rgba(20,6,8,0.7)" }}>
          <div>
            <h4 className="text-sm font-semibold text-white">Transit Reliability Index</h4>
            <p className="text-[10px] text-muted-foreground font-mono mb-6">Current performance vs. standard baseline capacity.</p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" {...CHART_STYLE.axisStyle} />
                <YAxis type="category" dataKey="route" width={90} style={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} />
                <Tooltip {...CHART_STYLE} />
                <Bar dataKey="current" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={8} />
                <Bar dataKey="normal" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Supplier Radar Diagnostics & Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Supplier Score Diagnostics */}
        <div className="rounded-2xl p-5 border border-border/5"
          style={{ background: "rgba(20,6,8,0.7)" }}>
          <div>
            <h4 className="text-sm font-semibold text-white">Sourcing Portfolio Analysis</h4>
            <p className="text-[10px] text-muted-foreground font-mono mb-4">Supplier metrics comparing cost, reliability, risk & quality.</p>
          </div>
          
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={supplyCostData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="name" style={{ fontSize: 8, fill: "rgba(255,255,255,0.6)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Reliability" dataKey="reliability" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Radar name="Risk Index" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                <Tooltip {...CHART_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive geopolitical warning timeline */}
        <div className="lg:col-span-2 rounded-2xl p-5 border border-border/5 flex flex-col"
          style={{ background: "rgba(20,6,8,0.7)" }}>
          <div>
            <h4 className="text-sm font-semibold text-white">Predictive Risk Timeline</h4>
            <p className="text-[10px] text-muted-foreground font-mono mb-4">Forecasted disruption signals & AI confidence ratings.</p>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto">
            {[
              { title: "Suez Canal bottleneck escalation", date: "T+15 Days", type: "Maritime Block", probability: "High (82%)", color: "#ef4444" },
              { title: "OPEC+ quota adjustment decision", date: "T+30 Days", type: "Pricing Volatility", probability: "Moderate (65%)", color: "#f59e0b" },
              { title: "Strait of Malacca naval exercises", date: "T+45 Days", type: "Congestion Delay", probability: "Low (30%)", color: "#3b82f6" },
              { title: "Domestic refinery expansion online", date: "T+60 Days", type: "Supply Buffer Boost", probability: "Certain (99%)", color: "#22c55e" },
            ].map((evt) => (
              <div key={evt.title} className="flex items-start justify-between p-3.5 rounded-xl border border-border/5"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div>
                  <div className="text-xs font-bold text-white">{evt.title}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>{evt.type}</span>
                    <span>·</span>
                    <span>{evt.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold" style={{ color: evt.color }}>{evt.probability}</div>
                  <div className="text-[8px] font-mono text-muted-foreground mt-1">AI CONFIDENCE</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
