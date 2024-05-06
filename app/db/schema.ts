import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  provider: text("provider").notNull(),
  providerId: text("provider_id").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon"),
  base64Image: text("base64_image"),
  imageS3Key: text("imageS3Key"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
  notifications: many(notificationsTable, {
    relationName: "userNotificationsToUsers",
  }),
  likes: many(likesTable),
  followers: many(followsTable, { relationName: "followers" }),
  followees: many(followsTable, { relationName: "followees" }),
}));

// Posts
export const postsTable = sqliteTable("posts", {
  id: text("id")
    .primaryKey()
    .default(
      sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || '4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`
    ),
  prompt: text("prompt").notNull(),
  imageS3Key: text("image_s3_key"),
  base64Image: text("base64_image"),
  analysisScore: integer("analysis_score"),
  analysisResult: integer("analysis_result", { mode: "boolean" }),
  modelVersion: text("model_version"),
  hashTags: text("hash_tags", { mode: "json" }).default(sql`(json_array())`),
  imageName: text("image_name").notNull(),
  imageAge: text("image_age").notNull(),
  imageBirthplace: text("image_birthplace"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
});

export const postsRelations = relations(postsTable, ({ one, many }) => ({
  likes: many(likesTable),
  user: one(usersTable, {
    // リレーション先
    fields: [postsTable.userId], // リレーション元
    references: [usersTable.id], // リレーション先
  }),
}));

// Likes
export const likesTable = sqliteTable("likes", {
  id: text("id")
    .primaryKey()
    .default(
      sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || '4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`
    ),
  likeType: text("like_type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  postId: text("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
});

export const likesRelations = relations(likesTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [likesTable.postId],
    references: [postsTable.id],
  }),
  user: one(usersTable, {
    fields: [likesTable.userId],
    references: [usersTable.id],
  }),
}));

// Follows
export const followsTable = sqliteTable("follows", {
  id: text("id")
    .primaryKey()
    .default(
      sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || '4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`
    ),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
  followerId: text("follower_id")
    .notNull()
    .references(() => usersTable.id),
  followeeId: text("followee_id")
    .notNull()
    .references(() => usersTable.id),
});

export const followsRelations = relations(followsTable, ({ one }) => ({
  follower: one(usersTable, {
    fields: [followsTable.followerId],
    references: [usersTable.id],
    relationName: "followers",
  }),
  followee: one(usersTable, {
    fields: [followsTable.followeeId],
    references: [usersTable.id],
    relationName: "followees",
  }),
}));

// Notifications
export const notificationsTable = sqliteTable("notifications", {
  id: text("id")
    .primaryKey()
    .default(
      sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || '4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`
    ),
  notificationType: text("notification_type").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  notifierUserId: text("notifier_user_id")
    .notNull()
    .references(() => usersTable.id),
  postId: text("post_id").references(() => postsTable.id, {
    onDelete: "cascade",
  }),
});

export const notificationsRelations = relations(
  notificationsTable,
  ({ one }) => ({
    user: one(usersTable, {
      // リレーション先
      fields: [notificationsTable.userId], // リレーション元
      references: [usersTable.id], // リレーション先
      relationName: "userNotificationsToUsers",
    }),
    notifierUser: one(usersTable, {
      // リレーション先
      fields: [notificationsTable.notifierUserId], // リレーション元
      references: [usersTable.id], // リレーション先
      relationName: "notifierUserNotificationsToUsers",
    }),
    post: one(postsTable, {
      // リレーション先
      fields: [notificationsTable.postId], // リレーション元
      references: [postsTable.id], // リレーション先
      relationName: "postNotificationsToPosts",
    }),
  })
);
