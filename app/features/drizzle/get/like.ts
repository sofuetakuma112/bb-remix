import { likesTable, usersTable } from "@/db/schema";
import { serializeLike } from "@/features/serializers/like";
import { DrizzleClient } from "@/features/types/drizzle";
import { AppLoadContext } from "@remix-run/cloudflare";
import { eq, and } from "drizzle-orm";

export async function getLikePosts(
  db: DrizzleClient,
  context: AppLoadContext,
  userId: string,
  currentUserId: string,
  likeType: "like" | "super_like"
) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const likes = await db.query.likesTable.findMany({
    where: and(
      eq(likesTable.userId, currentUserId),
      eq(likesTable.likeType, likeType)
    ),
    with: {
      post: {
        with: {
          user: true,
          likes: true,
        },
      },
    },
  });

  return {
    posts: await Promise.all(likes.map((like) => serializeLike(context, like))),
  };
}
