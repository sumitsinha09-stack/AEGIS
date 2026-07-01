import { pgTable, text, serial, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shippingCorridorsTable = pgTable("shipping_corridors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  riskLevel: text("risk_level").notNull(),
  riskScore: real("risk_score").notNull(),
  volumeMbpd: real("volume_mbpd").notNull(),
  status: text("status").notNull(), // OPEN | RESTRICTED | CLOSED
  waypoints: jsonb("waypoints").notNull().$type<number[][]>(),
});

export const insertShippingCorridorSchema = createInsertSchema(shippingCorridorsTable);
export type InsertShippingCorridor = z.infer<typeof insertShippingCorridorSchema>;
export type ShippingCorridor = typeof shippingCorridorsTable.$inferSelect;
