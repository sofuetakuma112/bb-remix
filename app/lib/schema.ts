import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  provider: text("provider").notNull(),
  providerId: text("provider_id").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey(),
  body: text("body"),
  userId: integer("user_id").references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
