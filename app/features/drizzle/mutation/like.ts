import { likesTable, postsTable, notificationsTable } from "@/db/schema";
import { DrizzleClient } from "@/features/types/drizzle";
import { and, eq } from "drizzle-orm";

export const like = async (
  db: DrizzleClient,
  userId: string,
  postId: string,
  likeType: string
) => {
  const existingLike = await db.query.likesTable.findFirst({
    where: and(eq(likesTable.postId, postId), eq(likesTable.userId, userId)),
  });
  
  if (existingLike) {
    // いいね一覧からunlikeしたとき用
    await db
      .update(likesTable)
      .set({ likeType })
      .where(eq(likesTable.id, existingLike.id));
  } else {
    await db.insert(likesTable).values({
      postId,
      userId,
      likeType,
    });
  }

  const post = await db.query.postsTable.findFirst({
    where: eq(postsTable.id, postId),
  });
  if (post && post.userId !== userId && likeType !== "unlike") {
    await db.insert(notificationsTable).values({
      userId: post.userId,
      postId,
      notifierUserId: userId,
      notificationType: likeType,
    });
  }
};
