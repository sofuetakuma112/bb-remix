import { usersTable } from "@/db/schema";
import { serializeUser } from "@/features/serializers/user";
import { DrizzleClient } from "@/features/types/drizzle";
import { AppLoadContext } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";

export async function getUser(
  db: DrizzleClient,
  context: AppLoadContext,
  userId: string,
  currentUserId: string
) {
  const [user, currentUser] = await Promise.all([
    db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
      with: {
        posts: true,
        likes: true,
        followers: true,
        followees: true,
      },
    }),
    db.query.usersTable.findFirst({
      where: eq(usersTable.id, currentUserId),
      with: {
        notifications: true,
        followers: true,
        followees: true,
      },
    }),
  ]);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  if (!currentUser) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return {
    user: await serializeUser(context, user, currentUser),
  };
}
