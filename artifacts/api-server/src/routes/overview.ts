import { Router, type IRouter } from "express";
import { db, riskScoresTable, reserveStatusTable, procurementRecommendationsTable, supplierRisksTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/overview/summary", async (req, res): Promise<void> => {
  const [riskScores, reserve, procurement] = await Promise.all([
    db.select().from(riskScoresTable),
    db.select().from(reserveStatusTable).limit(1),
    db.select().from(procurementRecommendationsTable).orderBy(procurementRecommendationsTable.rank).limit(3),
  ]);

  const avgRisk = riskScores.length > 0
    ? riskScores.reduce((s, r) => s + r.score, 0) / riskScores.length
    : 45;

  const reserveData = reserve[0];
  const reserveDays = reserveData?.currentDays ?? 9.5;

  const systemState = avgRisk >= 75 ? "CRITICAL" : avgRisk >= 50 ? "ELEVATED" : "NOMINAL";

  const corridorSparklines: Record<string, number[]> = {};
  for (const rs of riskScores) {
    corridorSparklines[rs.corridor] = Array.from({ length: 7 }, (_, i) =>
      Math.max(0, Math.min(100, rs.score + (Math.random() * 20 - 10) * (i / 7)))
    );
  }

  const moduleSummaries = [
    {
      module: "Risk Intelligence",
      headline: "Hormuz Risk Score",
      value: riskScores.find(r => r.corridor === "Strait of Hormuz")?.score ?? 68,
      unit: "/100",
      trend: "increasing" as const,
      sparkline: Array.from({ length: 8 }, (_, i) => 45 + i * 4 + Math.random() * 5),
    },
    {
      module: "Scenario Modeller",
      headline: "Active Scenario Impact",
      value: 2.3,
      unit: "% GDP",
      trend: "stable" as const,
      sparkline: Array.from({ length: 8 }, () => 1.5 + Math.random() * 2),
    },
    {
      module: "Procurement",
      headline: "Top Source Score",
      value: procurement[0]?.overallScore ?? 87,
      unit: "/100",
      trend: "up" as const,
      sparkline: Array.from({ length: 8 }, (_, i) => 70 + i * 2 + Math.random() * 5),
    },
    {
      module: "Reserve Optimizer",
      headline: "SPR Cover",
      value: reserveDays,
      unit: " days",
      trend: "decreasing" as const,
      sparkline: Array.from({ length: 8 }, (_, i) => reserveDays + (7 - i) * 0.3 - Math.random()),
    },
    {
      module: "Digital Twin",
      headline: "Corridors At Risk",
      value: riskScores.filter(r => r.level === "HIGH" || r.level === "CRITICAL").length,
      unit: " corridors",
      trend: "increasing" as const,
      sparkline: Array.from({ length: 8 }, (_, i) => Math.floor(i / 2)),
    },
  ];

  res.json({
    systemState,
    riskScore: parseFloat(avgRisk.toFixed(1)),
    reserveDays,
    activeScenario: null,
    moduleSummaries,
    lastUpdated: new Date().toISOString(),
  });
});

router.post("/overview/run-simulation", async (req, res): Promise<void> => {
  const { scenarioId, severity = 75 } = req.body ?? {};

  const riskScores = await db.select().from(riskScoresTable);
  const procurement = await db.select().from(procurementRecommendationsTable).orderBy(procurementRecommendationsTable.rank).limit(5);

  const multiplier = severity / 100;
  const updatedScores = riskScores.map(r => ({
    ...r,
    score: Math.min(100, r.score * (1 + multiplier * 0.4)),
    level: r.score * (1 + multiplier * 0.4) >= 75 ? "CRITICAL" : r.score >= 50 ? "HIGH" : "MODERATE",
    trend: "increasing",
    lastUpdated: r.lastUpdated,
  }));

  const avgScore = updatedScores.reduce((s, r) => s + r.score, 0) / updatedScores.length;
  const systemState = avgScore >= 75 ? "CRITICAL" : avgScore >= 50 ? "ELEVATED" : "NOMINAL";

  const scenarioLabels: Record<string, string> = {
    hormuz_closure: "Strait of Hormuz Partial Closure",
    opec_cut: "OPEC+ Emergency Production Cut",
    red_sea_suspension: "Red Sea Route Suspension",
    pipeline_sabotage: "Gulf Pipeline Sabotage",
    sanctions_escalation: "Iran Sanctions Escalation",
  };

  res.json({
    systemState,
    riskScores: updatedScores,
    procurementPlan: procurement,
    reserveAction: severity >= 75
      ? "IMMEDIATE: Activate SPR drawdown at 0.5 MBPD. Alert refineries for blend substitution."
      : "MONITOR: Pre-position tanker capacity. Increase spot market coverage by 15%.",
    impactSummary: `Simulation: ${scenarioLabels[scenarioId] ?? scenarioId ?? "Generic Disruption"} at ${severity}% severity. System state elevated to ${systemState}. ${updatedScores.filter(r => r.level === "CRITICAL").length} corridors critical.`,
  });
});

export default router;
