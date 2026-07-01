import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reserveStatusTable = pgTable("reserve_status", {
  id: serial("id").primaryKey(),
  currentDays: real("current_days").notNull(),
  capacityDays: real("capacity_days").notNull(),
  fillPercent: real("fill_percent").notNull(),
  drawdownRate: real("drawdown_rate").notNull(),
  recommendedAction: text("recommended_action").notNull(),
  riskOfDepletion: text("risk_of_depletion").notNull(),
  replenishmentWindow: text("replenishment_window").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReserveStatusSchema = createInsertSchema(reserveStatusTable).omit({ id: true, updatedAt: true });
export type InsertReserveStatus = z.infer<typeof insertReserveStatusSchema>;
export type ReserveStatus = typeof reserveStatusTable.$inferSelect;
