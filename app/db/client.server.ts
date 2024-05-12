import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

export const getDBClient = (d1: D1Database) => {
  const db = drizzle(d1, { logger: import.meta.env.DEV, schema });
  return db;
};
