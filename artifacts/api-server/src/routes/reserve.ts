import { Router, type IRouter } from "express";
import { db, reserveStatusTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/reserve/status", async (_req, res): Promise<void> => {
  const [status] = await db.select().from(reserveStatusTable).limit(1);
  if (!status) {
    res.status(404).json({ error: "Reserve status not found" });
    return;
  }
  res.json({
    currentDays: status.currentDays,
    capacityDays: status.capacityDays,
    fillPercent: status.fillPercent,
    drawdownRate: status.drawdownRate,
    recommendedAction: status.recommendedAction,
    riskOfDepletion: status.riskOfDepletion,
    replenishmentWindow: status.replenishmentWindow,
  });
});

router.post("/reserve/optimize", async (req, res): Promise<void> => {
  const { scenarioId = "hormuz_closure", drawdownRateMbpd = 0.3 } = req.body ?? {};

  const [current] = await db.select().from(reserveStatusTable).limit(1);
  const currentDays = current?.currentDays ?? 9.5;
  const dailyConsumption = 5.2; // MBPD

  const supplyGapMbpd = scenarioId === "hormuz_closure" ? 2.1 :
    scenarioId === "opec_cut" ? 0.8 :
    scenarioId === "red_sea_suspension" ? 1.4 : 0.6;

  const netDrawdown = Math.max(0, drawdownRateMbpd);
  const daysUntilDepletion = netDrawdown > 0
    ? Math.floor((currentDays * dailyConsumption) / netDrawdown)
    : null;

  const depletionDate = daysUntilDepletion
    ? new Date(Date.now() + daysUntilDepletion * 86400000).toISOString().split("T")[0]
    : null;

  const replenishStart = new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0];

  const recommendedRate = Math.min(supplyGapMbpd * 0.85, 0.6);

  let actionBanner: string;
  if (netDrawdown > 0.5 || (scenarioId === "hormuz_closure")) {
    actionBanner = `CRITICAL ACTION: Authorize SPR drawdown at ${recommendedRate.toFixed(2)} MBPD. Notify Mangalore, Padur, and Visakhapatnam SPR facilities. Estimated depletion: ${daysUntilDepletion ?? 'N/A'} days at current rate. Begin emergency replenishment procurement immediately.`;
  } else if (supplyGapMbpd > 0.5) {
    actionBanner = `ELEVATED ALERT: Pre-position SPR drawdown authorization. Recommended rate: ${recommendedRate.toFixed(2)} MBPD. Monitor supply gap — activate within 72 hours if situation deteriorates.`;
  } else {
    actionBanner = `MONITOR: No immediate SPR drawdown required. Maintain current reserve levels. Schedule routine replenishment window beginning ${replenishStart}.`;
  }

  res.json({
    recommendedDrawdownRate: recommendedRate,
    depletionDate,
    repletionDate: null,
    replenishmentStart: replenishStart,
    actionBanner,
  });
});

router.get("/reserve/drawdown-schedule", async (_req, res): Promise<void> => {
  const [current] = await db.select().from(reserveStatusTable).limit(1);
  const startDays = current?.currentDays ?? 9.5;
  const dailyDemand = 5.2;

  const schedule = [];
  const today = new Date();
  let reserveLevel = startDays * dailyDemand;

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const demandForecast = dailyDemand + (Math.random() * 0.4 - 0.2);
    const drawdown = i < 15 ? 0.35 : 0;
    const supplyGap = i < 10 ? 1.8 - i * 0.12 : 0;
    reserveLevel = Math.max(0, reserveLevel - drawdown);

    schedule.push({
      date: date.toISOString().split("T")[0],
      reserveLevel: parseFloat(reserveLevel.toFixed(2)),
      demandForecast: parseFloat(demandForecast.toFixed(2)),
      supplyGap: parseFloat(supplyGap.toFixed(2)),
    });
  }

  res.json(schedule);
});

export default router;
