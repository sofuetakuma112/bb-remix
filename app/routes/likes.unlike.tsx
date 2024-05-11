import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { getDBClient } from "@/lib/client.server";
import { likesTable } from "@/db/schema";
import { getAuthenticator } from "@/services/auth.server";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser || !currentUser.id) return redirect("/login");

  if (currentUser) {
    const userId = currentUser.id;
    const db = getDBClient(context.cloudflare.env.DB);
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
