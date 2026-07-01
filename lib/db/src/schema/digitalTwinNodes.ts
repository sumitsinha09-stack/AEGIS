import { pgTable, text, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const digitalTwinNodesTable = pgTable("digital_twin_nodes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // port | refinery | storage | strait | terminal
  lat: real("lat").notNull(),
  lon: real("lon").notNull(),
  riskLevel: text("risk_level").notNull(),
  details: text("details").notNull(),
});

export const insertDigitalTwinNodeSchema = createInsertSchema(digitalTwinNodesTable);
export type InsertDigitalTwinNode = z.infer<typeof insertDigitalTwinNodeSchema>;
export type DigitalTwinNode = typeof digitalTwinNodesTable.$inferSelect;
