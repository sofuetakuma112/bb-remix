import { notificationsTable, usersTable } from "@/db/schema";
import { serializeNotification } from "@/features/serializers/notification";
import { DrizzleClient } from "@/features/types/drizzle";
import { AppLoadContext } from "@remix-run/cloudflare";
import { eq, desc, inArray } from "drizzle-orm";

export const getNotifications = async (
  db: DrizzleClient,
  context: AppLoadContext,
  currentUserId: string
) => {
  const [notifications, currentUser] = await Promise.all([
    db.query.notificationsTable.findMany({
      where: eq(notificationsTable.userId, currentUserId),
      orderBy: desc(notificationsTable.createdAt),
      with: {
        notifierUser: true,
      },
    }),
    db.query.usersTable.findFirst({
      where: eq(usersTable.id, currentUserId),
    }),
  ]);

  if (!currentUser) {
    throw new Response("CurrentUser not found", { status: 404 });
  }

  const unreadNotifications = notifications.filter((n) => !n.read);

  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(
      unreadNotifications.length > 0
        ? inArray(
            notificationsTable.id,
            unreadNotifications.map((n) => n.id)
          )
        : undefined
    );

  return {
    notifications: await Promise.all(
      notifications.map((n) => serializeNotification(context, n))
    ),
  };
};
