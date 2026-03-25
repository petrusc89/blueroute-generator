import { reports, type Report, type InsertReport } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getReports(): Report[];
  getReport(id: number): Report | undefined;
  createReport(data: InsertReport): Report;
  updateReport(id: number, data: Partial<InsertReport>): Report | undefined;
  deleteReport(id: number): void;
}

export class DatabaseStorage implements IStorage {
  getReports(): Report[] {
    return db.select().from(reports).all();
  }

  getReport(id: number): Report | undefined {
    return db.select().from(reports).where(eq(reports.id, id)).get();
  }

  createReport(data: InsertReport): Report {
    const now = new Date().toISOString();
    return db.insert(reports).values({
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning().get();
  }

  updateReport(id: number, data: Partial<InsertReport>): Report | undefined {
    const now = new Date().toISOString();
    return db.update(reports)
      .set({ ...data, updatedAt: now })
      .where(eq(reports.id, id))
      .returning()
      .get();
  }

  deleteReport(id: number): void {
    db.delete(reports).where(eq(reports.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
