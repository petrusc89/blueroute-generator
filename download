import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Document info
  state: text("state").default("Draft"),
  version: text("version").default("V1.0"),
  revision: text("revision").default("RevA"),
  engineer: text("engineer").default(""),
  date: text("date").default(""),
  odooRef: text("odoo_ref").default(""),
  // Customer & Ship
  customerName: text("customer_name").default(""),
  shipName: text("ship_name").default(""),
  vesselImageUrl: text("vessel_image_url").default(""),
  vesselImageSource: text("vessel_image_source").default(""),
  vesselImageAccessDate: text("vessel_image_access_date").default(""),
  // Vessel parameters (stored as JSON text)
  vesselParams: text("vessel_params").default("{}"),
  // EconoWind assumptions (stored as JSON text)
  assumptions: text("assumptions").default("{}"),
  // Route definition (stored as JSON array)
  waypoints: text("waypoints").default("[]"),
  departureCountry: text("departure_country").default(""),
  departureCity: text("departure_city").default(""),
  destinationCountry: text("destination_country").default(""),
  destinationCity: text("destination_city").default(""),
  // VentoFoil configurations (JSON array of {model, quantity})
  vfConfigs: text("vf_configs").default("[]"),
  // Blue Route results (JSON: { outbound: [...], return: [...] })
  blueRouteResults: text("blue_route_results").default("{}"),
  // Speed range
  minSpeed: text("min_speed").default(""),
  maxSpeed: text("max_speed").default(""),
  // Metadata
  createdAt: text("created_at").default(""),
  updatedAt: text("updated_at").default(""),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
