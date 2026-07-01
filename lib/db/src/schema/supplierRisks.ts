import { pgTable, text, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const supplierRisksTable = pgTable("supplier_risks", {
  id: serial("id").primaryKey(),
  supplier: text("supplier").notNull(),
  country: text("country").notNull(),
  share: real("share").notNull(),
  riskScore: real("risk_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  primaryRoute: text("primary_route").notNull(),
  notes: text("notes").notNull(),
});

export const insertSupplierRiskSchema = createInsertSchema(supplierRisksTable).omit({ id: true });
export type InsertSupplierRisk = z.infer<typeof insertSupplierRiskSchema>;
export type SupplierRisk = typeof supplierRisksTable.$inferSelect;
