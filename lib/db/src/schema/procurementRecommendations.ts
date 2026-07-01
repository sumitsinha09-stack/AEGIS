import { pgTable, text, serial, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const procurementRecommendationsTable = pgTable("procurement_recommendations", {
  id: serial("id").primaryKey(),
  rank: integer("rank").notNull(),
  supplier: text("supplier").notNull(),
  country: text("country").notNull(),
  route: text("route").notNull(),
  spotPrice: real("spot_price").notNull(),
  tankerAvailability: real("tanker_availability").notNull(),
  portCongestion: real("port_congestion").notNull(),
  gradeCompatibility: real("grade_compatibility").notNull(),
  overallScore: real("overall_score").notNull(),
  reasoning: text("reasoning").notNull(),
  status: text("status").notNull(), // RECOMMENDED | VIABLE | MARGINAL | AVOID
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProcurementRecommendationSchema = createInsertSchema(procurementRecommendationsTable).omit({ id: true, createdAt: true });
export type InsertProcurementRecommendation = z.infer<typeof insertProcurementRecommendationSchema>;
export type ProcurementRecommendation = typeof procurementRecommendationsTable.$inferSelect;
