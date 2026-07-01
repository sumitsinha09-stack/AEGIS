import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskScoresTable = pgTable("risk_scores", {
  id: serial("id").primaryKey(),
  corridor: text("corridor").notNull(),
  score: real("score").notNull(),
  level: text("level").notNull(), // LOW | MODERATE | HIGH | CRITICAL
  trend: text("trend").notNull(), // increasing | decreasing | stable
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRiskScoreSchema = createInsertSchema(riskScoresTable).omit({ id: true, lastUpdated: true });
export type InsertRiskScore = z.infer<typeof insertRiskScoreSchema>;
export type RiskScore = typeof riskScoresTable.$inferSelect;
