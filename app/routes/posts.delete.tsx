import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { getDBClient } from "@/lib/client.server";
import { postsTable } from "@/db/schema";
import { getAuthenticator } from "@/services/auth.server";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    const userId = user.id;
    const db = getDBClient(context.cloudflare.env.DB);
    const formData = await request.formData();
    const postId = formData.get("postId")?.toString();
    // validation
    if (postId == null) {
      return new Response("postId is required", { status: 400 });
    }

    // ログインユーザーの投稿かチェック
    const post = await db.query.postsTable.findFirst({
      where: and(eq(postsTable.id, postId), eq(postsTable.userId, userId)),
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    await db.delete(postsTable).where(eq(postsTable.id, post.id));
  }
  return null;
};
