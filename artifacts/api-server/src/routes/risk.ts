import { Router, type IRouter } from "express";
import { db, riskScoresTable, newsSignalsTable, supplierRisksTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/risk/scores", async (_req, res): Promise<void> => {
  const scores = await db.select().from(riskScoresTable).orderBy(desc(riskScoresTable.score));
  res.json(scores.map(s => ({ ...s, lastUpdated: s.lastUpdated.toISOString() })));
});

router.post("/risk/scores/refresh", async (req, res): Promise<void> => {
  const scores = await db.select().from(riskScoresTable);

  const updated = await Promise.all(
    scores.map(async s => {
      const delta = (Math.random() - 0.4) * 8;
      const newScore = Math.max(0, Math.min(100, s.score + delta));
      const newLevel =
        newScore >= 75 ? "CRITICAL" : newScore >= 50 ? "HIGH" : newScore >= 25 ? "MODERATE" : "LOW";
      const newTrend = delta > 1 ? "increasing" : delta < -1 ? "decreasing" : "stable";

      const [updated] = await db
        .update(riskScoresTable)
        .set({ score: newScore, level: newLevel, trend: newTrend, lastUpdated: new Date() })
        .where({ id: s.id } as any)
        .returning();
      return updated;
    })
  );

  res.json(updated.map(s => ({ ...s, lastUpdated: s.lastUpdated.toISOString() })));
});

router.get("/risk/signals", async (_req, res): Promise<void> => {
  const signals = await db.select().from(newsSignalsTable).orderBy(desc(newsSignalsTable.timestamp)).limit(50);
  res.json(signals.map(s => ({ ...s, timestamp: s.timestamp.toISOString() })));
});

router.get("/risk/suppliers", async (_req, res): Promise<void> => {
  const suppliers = await db.select().from(supplierRisksTable).orderBy(desc(supplierRisksTable.riskScore));
  res.json(suppliers);
});

export default router;
