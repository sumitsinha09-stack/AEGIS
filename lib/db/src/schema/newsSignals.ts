import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const newsSignalsTable = pgTable("news_signals", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  headline: text("headline").notNull(),
  source: text("source").notNull(),
  corridor: text("corridor").notNull(),
  severity: text("severity").notNull(), // LOW | MODERATE | HIGH | CRITICAL
  extractedRisk: text("extracted_risk").notNull(),
});

export const insertNewsSignalSchema = createInsertSchema(newsSignalsTable).omit({ id: true, timestamp: true });
export type InsertNewsSignal = z.infer<typeof insertNewsSignalSchema>;
export type NewsSignal = typeof newsSignalsTable.$inferSelect;
