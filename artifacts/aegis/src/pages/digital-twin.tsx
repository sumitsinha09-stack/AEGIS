import { useState } from "react";
import {
  useGetDigitalTwinNodes, getGetDigitalTwinNodesQueryKey,
  useGetDigitalTwinCorridors, getGetDigitalTwinCorridorsQueryKey,
  useRunWhatIf,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Crosshair, Info, MapPin, Waves } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AnyItem = Record<string, any>;

function riskColor(level: string): string {
  switch (level) {
    case "CRITICAL": return "#ef4444";
    case "HIGH":     return "#f59e0b";
    case "MODERATE": return "#fb923c";
    default:         return "#22c55e";
  }
}

// Equirectangular projection — viewport: lon 20–100, lat -10 to 50
function toSvg(lat: number, lon: number, w = 1000, h = 500): { x: number; y: number } {
  const lonMin = 20, lonMax = 100;
  const latMin = -15, latMax = 52;
  const x = ((lon - lonMin) / (lonMax - lonMin)) * w;
  const y = ((latMax - lat) / (latMax - latMin)) * h;
  return { x, y };
}

// Thin transparent hit-area polyline to make clicking easy
function HitPolyline({
  points, onClick, isSelected,
}: { points: string; onClick: () => void; isSelected: boolean }) {
  return (
    <>
      {/* Wide transparent hit target */}
      <polyline
        points={points}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer"
        style={{ pointerEvents: "stroke" }}
        onClick={onClick}
      />
      {/* Visible line — no pointer events, so clicks go through to hit target */}
      <polyline
        points={points}
        fill="none"
        style={{ pointerEvents: "none" }}
        stroke={isSelected ? "#ffffff" : "currentColor"}
        strokeWidth={isSelected ? 4 : 2.5}
        strokeOpacity={isSelected ? 0.9 : 0.55}
      />
    </>
  );
}

export default function DigitalTwin() {
  const { data: nodes, isLoading: isLoadingNodes } = useGetDigitalTwinNodes({ query: { queryKey: getGetDigitalTwinNodesQueryKey() } });
  const { data: corridors, isLoading: isLoadingCorridors } = useGetDigitalTwinCorridors({ query: { queryKey: getGetDigitalTwinCorridorsQueryKey() } });
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);
  const [selectedKind, setSelectedKind] = useState<"node" | "corridor" | null>(null);
  const [whatIfResult, setWhatIfResult] = useState<any>(null);
  const whatIf = useRunWhatIf();

  if (isLoadingNodes || isLoadingCorridors || !nodes || !corridors) {
    return (
      <div className="h-[calc(100vh-10rem)]">
        <Skeleton className="h-full w-full rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
      </div>
    );
  }

  const selectNode = (node: AnyItem) => {
    setSelectedItem(node);
    setSelectedKind("node");
    setWhatIfResult(null);
  };

  const selectCorridor = (corr: AnyItem) => {
    setSelectedItem(corr);
    setSelectedKind("corridor");
    setWhatIfResult(null);
  };

  const handleWhatIf = (disruptionType: string) => {
    if (!selectedItem || !selectedKind) return;
    whatIf.mutate({
      data: { targetId: selectedItem.id, targetType: selectedKind, disruptionType },
    }, { onSuccess: (data) => setWhatIfResult(data) });
  };

  return (
    <div className="space-y-4" style={{ height: "calc(100vh - 9rem)" }}>
      <div>
        <h2 className="text-2xl font-bold">Digital Twin</h2>
        <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
          LIVE TOPOLOGICAL MAP — CLICK ANY NODE OR CORRIDOR TO INSPECT
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0"
        style={{ height: "calc(100% - 60px)" }}>

        {/* ── MAP PANEL ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden relative"
          style={{ background: "#06020a", border: "1px solid rgba(217,64,52,0.2)" }}>

          {/* Grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(217,64,52,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(217,64,52,0.04) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }} />

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(217,64,52,0.04) 0%, transparent 65%)" }} />

          <svg
            className="w-full h-full"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: "block" }}>

            {/* Landmasses (simplified blobs for context) */}
            <g opacity={0.07} fill="rgba(255,255,255,1)" stroke="rgba(255,255,255,0.4)" strokeWidth={0.5}>
              {/* Arabian Peninsula */}
              <ellipse cx={530} cy={230} rx={80} ry={80} />
              {/* Persian Gulf area */}
              <ellipse cx={520} cy={165} rx={55} ry={30} />
              {/* India */}
              <ellipse cx={680} cy={270} rx={60} ry={100} />
              {/* East Africa */}
              <ellipse cx={355} cy={240} rx={35} ry={90} />
              {/* Horn of Africa */}
              <ellipse cx={390} cy={185} rx={40} ry={35} />
              {/* Red Sea coast */}
              <ellipse cx={420} cy={130} rx={30} ry={60} />
            </g>

            {/* Corridors */}
            {corridors.map((c: AnyItem) => {
              if (!c.waypoints || c.waypoints.length < 2) return null;
              const isSelected = selectedItem?.id === c.id;
              const color = riskColor(c.riskLevel);
              const points = c.waypoints
                .map((wp: [number, number]) => {
                  const { x, y } = toSvg(wp[0], wp[1]);
                  return `${x},${y}`;
                })
                .join(" ");

              return (
                <g key={c.id} style={{ color }}>
                  {/* Glow layer */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth={isSelected ? 10 : 6}
                    strokeOpacity={isSelected ? 0.25 : 0.1}
                    style={{ pointerEvents: "none" }}
                    strokeLinecap="round"
                  />
                  {/* Dashed flow */}
                  {c.status === "OPEN" && (
                    <polyline
                      points={points}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      strokeOpacity={0.6}
                      strokeDasharray="6 18"
                      style={{ pointerEvents: "none" }}>
                      <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.5s" repeatCount="indefinite" />
                    </polyline>
                  )}
                  {/* Hit + visible line */}
                  <HitPolyline
                    points={points}
                    isSelected={isSelected}
                    onClick={() => selectCorridor(c)}
                  />
                  {/* Selected highlight ring at midpoint */}
                  {isSelected && (() => {
                    const mid = Math.floor(c.waypoints.length / 2);
                    const { x, y } = toSvg(c.waypoints[mid][0], c.waypoints[mid][1]);
                    return (
                      <circle cx={x} cy={y} r={14} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.8}>
                        <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                    );
                  })()}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node: AnyItem) => {
              const { x, y } = toSvg(node.lat, node.lon);
              const isSelected = selectedItem?.id === node.id;
              const color = riskColor(node.riskLevel);
              const r = node.type === "strait" ? 9 : node.type === "refinery" ? 7 : 5;

              return (
                <g
                  key={node.id}
                  transform={`translate(${x},${y})`}
                  className="cursor-pointer"
                  onClick={() => selectNode(node)}>

                  {/* Hit target — wide transparent circle */}
                  <circle r={20} fill="transparent" style={{ pointerEvents: "all" }} />

                  {/* Glow ring */}
                  <circle r={r + 8} fill={color} fillOpacity={isSelected ? 0.2 : 0.08} style={{ pointerEvents: "none" }} />

                  {/* Pulse ring when selected */}
                  {isSelected && (
                    <circle r={r + 4} fill="none" stroke={color} strokeWidth={1.5} style={{ pointerEvents: "none" }}>
                      <animate attributeName="r" values={`${r + 4};${r + 14};${r + 4}`} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Main dot */}
                  <circle
                    r={r}
                    fill={color}
                    stroke={isSelected ? "#ffffff" : "#000"}
                    strokeWidth={isSelected ? 2 : 1.5}
                    style={{ pointerEvents: "none", filter: `drop-shadow(0 0 4px ${color})` }}
                  />

                  {/* Label */}
                  <text
                    y={-(r + 8)}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={isSelected ? 11 : 9}
                    fontFamily="DM Mono, monospace"
                    fontWeight={isSelected ? "bold" : "normal"}
                    opacity={isSelected ? 1 : 0.65}
                    style={{ pointerEvents: "none" }}>
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 px-3 py-2 rounded-xl text-[9px] font-mono"
            style={{ background: "rgba(6,2,10,0.85)", border: "1px solid rgba(217,64,52,0.15)" }}>
            {[
              { label: "OPEN", color: "#22c55e" },
              { label: "RESTRICTED", color: "#f59e0b" },
              { label: "MODERATE", color: "#fb923c" },
              { label: "CRITICAL", color: "#ef4444" },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 4px ${l.color}` }} />
                {l.label}
              </span>
            ))}
          </div>

          {/* Type indicator */}
          <div className="absolute top-4 right-4 px-3 py-2 rounded-xl text-[9px] font-mono"
            style={{ background: "rgba(6,2,10,0.85)", border: "1px solid rgba(217,64,52,0.15)", color: "hsl(355 8% 55%)" }}>
            {selectedItem
              ? `SELECTED: ${selectedKind?.toUpperCase()} — ${selectedItem.name}`
              : "CLICK NODE OR CORRIDOR TO INSPECT"}
          </div>
        </div>

        {/* ── INFO PANEL ────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: "rgba(20,6,8,0.8)", border: "1px solid rgba(217,64,52,0.18)" }}>

          <div className="px-4 py-3 border-b flex items-center gap-2 shrink-0"
            style={{ borderColor: "rgba(217,64,52,0.12)", background: "rgba(217,64,52,0.05)" }}>
            {selectedKind === "corridor"
              ? <Waves className="w-4 h-4" style={{ color: "hsl(2 78% 65%)" }} />
              : <MapPin className="w-4 h-4" style={{ color: "hsl(2 78% 65%)" }} />}
            <span className="text-[10px] font-mono font-bold tracking-[0.15em]" style={{ color: "hsl(2 78% 65%)" }}>
              {selectedItem ? "INTELLIGENCE PANEL" : "SELECT AN ELEMENT"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4">

                  {/* Title */}
                  <div>
                    <div className="text-[9px] font-mono tracking-widest mb-1" style={{ color: "hsl(2 78% 60%)" }}>
                      {selectedKind === "corridor" ? "SHIPPING CORRIDOR" : `NODE · ${selectedItem.type?.toUpperCase()}`}
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {selectedItem.name}
                    </h3>

                    {/* Risk badge */}
                    {(() => {
                      const color = riskColor(selectedItem.riskLevel);
                      return (
                        <span className="inline-block mt-2 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                          {selectedItem.riskLevel} RISK
                        </span>
                      );
                    })()}
                  </div>

                  {/* Details */}
                  <div className="rounded-xl p-3 text-xs leading-relaxed"
                    style={{ background: "rgba(217,64,52,0.05)", border: "1px solid rgba(217,64,52,0.12)", color: "hsl(0 0% 75%)" }}>
                    {selectedItem.details || `Volume: ${selectedItem.volumeMbpd} Mbpd`}
                  </div>

                  {/* Node-specific metadata */}
                  {selectedKind === "node" && selectedItem.lat && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "LAT", value: `${selectedItem.lat?.toFixed(2)}°` },
                        { label: "LON", value: `${selectedItem.lon?.toFixed(2)}°` },
                        ...(selectedItem.capacityMbpd ? [{ label: "CAPACITY", value: `${selectedItem.capacityMbpd} Mbpd` }] : []),
                        ...(selectedItem.utilization ? [{ label: "UTILIZATION", value: `${selectedItem.utilization}%` }] : []),
                      ].map(item => (
                        <div key={item.label} className="rounded-lg px-3 py-2"
                          style={{ background: "rgba(217,64,52,0.04)", border: "1px solid rgba(217,64,52,0.1)" }}>
                          <div className="text-[8px] font-mono tracking-widest mb-0.5" style={{ color: "hsl(355 8% 48%)" }}>
                            {item.label}
                          </div>
                          <div className="text-xs font-mono font-bold text-white">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* What-If buttons */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Crosshair className="w-3 h-3" style={{ color: "hsl(2 78% 60%)" }} />
                      <span className="text-[9px] font-mono tracking-widest" style={{ color: "hsl(355 8% 50%)" }}>
                        EXECUTE WHAT-IF SIMULATION
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleWhatIf("CLOSURE")}
                        disabled={whatIf.isPending}
                        className="py-2 px-3 rounded-xl text-[9px] font-mono font-bold tracking-wider transition-all disabled:opacity-50"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#ef4444",
                        }}>
                        SIMULATE CLOSURE
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleWhatIf("DELAY")}
                        disabled={whatIf.isPending}
                        className="py-2 px-3 rounded-xl text-[9px] font-mono font-bold tracking-wider transition-all disabled:opacity-50"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.3)",
                          color: "#f59e0b",
                        }}>
                        SIMULATE DELAY
                      </motion.button>
                    </div>
                  </div>

                  {/* What-If Result */}
                  <AnimatePresence>
                    {whatIfResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl overflow-hidden"
                        style={{ background: "rgba(217,64,52,0.07)", border: "1px solid rgba(217,64,52,0.25)" }}>
                        <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                          <Info className="w-3.5 h-3.5" style={{ color: "hsl(2 78% 65%)" }} />
                          <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color: "hsl(2 78% 65%)" }}>
                            SIMULATION RESULT
                          </span>
                        </div>
                        <div className="px-4 pb-4 space-y-3">
                          <p className="text-xs font-medium text-white leading-snug">{whatIfResult.impactSummary}</p>
                          <div className="grid grid-cols-1 gap-1.5 text-[9px] font-mono"
                            style={{ color: "hsl(355 8% 60%)" }}>
                            <div>AFFECTED VOL:
                              <span className="text-white ml-1 font-bold">{whatIfResult.affectedVolumeMbpd} Mbpd</span>
                            </div>
                            <div>ALT ROUTES:
                              <span className="text-white ml-1 font-bold">{whatIfResult.alternativeRoutes?.join(", ")}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t" style={{ borderColor: "rgba(217,64,52,0.15)" }}>
                            <div className="text-[8px] font-mono tracking-widest mb-1" style={{ color: "hsl(355 8% 50%)" }}>
                              RECOMMENDATION
                            </div>
                            <p className="text-xs font-bold" style={{ color: "hsl(2 78% 65%)" }}>
                              {whatIfResult.recommendedAction}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12 gap-4">
                  <div className="p-4 rounded-2xl"
                    style={{ background: "rgba(217,64,52,0.06)", border: "1px solid rgba(217,64,52,0.12)" }}>
                    <Globe className="w-10 h-10" style={{ color: "rgba(217,64,52,0.35)" }} />
                  </div>
                  <div>
                    <div className="font-bold text-white mb-1 font-display">
                      No Element Selected
                    </div>
                    <p className="text-xs font-mono leading-relaxed" style={{ color: "hsl(355 8% 50%)" }}>
                      Click any node or shipping corridor on the map to view intelligence and run simulations
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
