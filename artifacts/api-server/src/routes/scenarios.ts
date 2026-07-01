import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SCENARIOS = [
  {
    id: "hormuz_closure",
    name: "Strait of Hormuz Closure",
    description: "Partial or full closure of the Strait of Hormuz due to military escalation, blocking 40% of India's crude supply.",
    icon: "anchor",
    defaultSeverity: 80,
    category: "Maritime",
  },
  {
    id: "opec_cut",
    name: "OPEC+ Emergency Cut",
    description: "OPEC+ announces an emergency production cut of 2-4 MBPD, causing a sharp spike in spot prices.",
    icon: "trending-down",
    defaultSeverity: 60,
    category: "Supply",
  },
  {
    id: "red_sea_suspension",
    name: "Red Sea Route Suspension",
    description: "Houthi attacks force suspension of Red Sea transit, rerouting tankers around the Cape of Good Hope (+12 days).",
    icon: "ship",
    defaultSeverity: 70,
    category: "Maritime",
  },
  {
    id: "pipeline_sabotage",
    name: "Gulf Pipeline Sabotage",
    description: "Critical Gulf pipeline infrastructure attacked, reducing spare capacity for export rerouting.",
    icon: "zap",
    defaultSeverity: 65,
    category: "Infrastructure",
  },
  {
    id: "sanctions_escalation",
    name: "Iran Sanctions Escalation",
    description: "Expanded US/EU sanctions on Iranian crude, blocking all Iranian supply lines into Indian refineries.",
    icon: "shield-alert",
    defaultSeverity: 55,
    category: "Geopolitical",
  },
  {
    id: "uae_dispute",
    name: "UAE-India Diplomatic Rift",
    description: "Diplomatic tension disrupts preferential access to UAE crude, impacting 8% of India's import volume.",
    icon: "flag",
    defaultSeverity: 40,
    category: "Geopolitical",
  },
];

function generateTimeSeries(baseValue: number, length: number, severity: number, direction: "up" | "down" = "down") {
  const points = [];
  const today = new Date();
  for (let i = 0; i < length; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i * 7);
    const multiplier = direction === "down" ? 1 - (severity / 100) * 0.4 * (i / length) : 1 + (severity / 100) * 0.3 * (i / length);
    points.push({
      date: date.toISOString().split("T")[0],
      value: parseFloat((baseValue * multiplier + (Math.random() * baseValue * 0.05 - baseValue * 0.025)).toFixed(2)),
    });
  }
  return points;
}

router.get("/scenarios", async (_req, res): Promise<void> => {
  res.json(SCENARIOS);
});

router.post("/scenarios/simulate", async (req, res): Promise<void> => {
  const { scenarioId, severity = 70 } = req.body ?? {};
  const scenario = SCENARIOS.find(s => s.id === scenarioId) ?? SCENARIOS[0];
  const sev = Math.max(0, Math.min(100, severity));

  const fuelImpact = sev * 0.35;
  const gdpImpact = sev * 0.028;
  const powerStress = sev * 0.6;
  const refineryRunRate = 85 - sev * 0.25;

  const impacts = [
    { metric: "Refinery Run Rate", before: 85, after: parseFloat(refineryRunRate.toFixed(1)), unit: "%", delta: parseFloat((refineryRunRate - 85).toFixed(1)), direction: "down" as const },
    { metric: "Domestic Fuel Price", before: 95.5, after: parseFloat((95.5 + fuelImpact * 0.5).toFixed(2)), unit: "₹/L", delta: parseFloat((fuelImpact * 0.5).toFixed(2)), direction: "up" as const },
    { metric: "Power Sector Stress Index", before: 35, after: parseFloat((35 + powerStress * 0.4).toFixed(1)), unit: "/100", delta: parseFloat((powerStress * 0.4).toFixed(1)), direction: "up" as const },
    { metric: "GDP Trajectory Impact", before: 0, after: parseFloat((-gdpImpact).toFixed(2)), unit: "% pts", delta: parseFloat((-gdpImpact).toFixed(2)), direction: "down" as const },
  ];

  const beforeAfter = {
    refineryRunRate: [
      ...generateTimeSeries(85, 6, 0),
      ...generateTimeSeries(refineryRunRate, 6, sev, "down"),
    ],
    fuelPriceDelta: [
      ...generateTimeSeries(95.5, 6, 0),
      ...generateTimeSeries(95.5 + fuelImpact * 0.5, 6, sev, "up"),
    ],
    powerStressIndex: [
      ...generateTimeSeries(35, 6, 0),
      ...generateTimeSeries(35 + powerStress * 0.4, 6, sev, "up"),
    ],
    gdpImpact: [
      ...generateTimeSeries(0, 6, 0),
      ...generateTimeSeries(-gdpImpact, 6, sev, "down"),
    ],
  };

  res.json({ scenarioId: scenario.id, severity: sev, impacts, beforeAfter });
});

export default router;
