import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { getDBClient } from "@/lib/client.server";
import { likesTable } from "@/db/schema";
import { getServerAuthSession } from "@/features/auth";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  if (currentUser) {
    const userId = currentUser.id;
    const formData = await request.formData();
    const postId = formData.get("postId")?.toString();
    // validation
    if (postId == null) {
      return new Response("postId is required", { status: 400 });
    }

    // ログインユーザーの投稿かチェック
    const like = await db.query.likesTable.findFirst({
      where: and(eq(likesTable.postId, postId), eq(likesTable.userId, userId)),
    });

    if (!like) {
      return new Response("Like not found", { status: 404 });
    }

    await db
      .update(likesTable)
      .set({
        likeType: "unlike",
      })
      .where(eq(likesTable.id, like.id));
  }
  return null;
};
