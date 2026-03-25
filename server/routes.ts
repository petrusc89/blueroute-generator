import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertReportSchema } from "@shared/schema";

export function registerRoutes(server: Server, app: Express) {
  // Get all reports
  app.get("/api/reports", (_req, res) => {
    const reports = storage.getReports();
    res.json(reports);
  });

  // Get single report
  app.get("/api/reports/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const report = storage.getReport(id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  });

  // Create report
  app.post("/api/reports", (req, res) => {
    try {
      const data = insertReportSchema.parse(req.body);
      const report = storage.createReport(data);
      res.status(201).json(report);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update report
  app.patch("/api/reports/:id", (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const report = storage.updateReport(id, req.body);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete report
  app.delete("/api/reports/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteReport(id);
    res.status(204).send();
  });
}
