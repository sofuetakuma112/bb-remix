import { postsTable, usersTable, likesTable } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { getImageUrlFromS3 } from "@/features/r2";
import { AppLoadContext } from "@remix-run/cloudflare";

export async function serializePost(
  context: AppLoadContext,
  post: InferSelectModel<typeof postsTable> & {
    user: InferSelectModel<typeof usersTable>;
    likes: InferSelectModel<typeof likesTable>[];
  }
) {
  const imageUrl = await getImageUrlFromS3(context, post.imageS3Key);

  return {
    id: post.id,
    prompt: post.prompt,
    imageUrl,
    analysisResult: post.analysisResult,
    likeCount: post.likes.filter((l) => l.likeType === "like").length,
    superLikeCount: post.likes.filter((l) => l.likeType === "super_like")
      .length,
    userId: post.userId,
    hashTags: post.hashTags,
    imageName: post.imageName,
    imageAge: post.imageAge,
    imageBirthplace: post.imageBirthplace,
    user: await serializeUser(context, post.user),
  };
}

export async function serializeUser(
  context: AppLoadContext,
  user: InferSelectModel<typeof usersTable>
) {
  const imageUrl = await getImageUrlFromS3(context, user.imageS3Key);

  return {
    id: user.id,
    name: user.name,
    imageUrl: imageUrl || user.icon,
  };
}

export type SerializedPost = Awaited<ReturnType<typeof serializePost>>;
export type SerializedUser = Awaited<ReturnType<typeof serializeUser>>;
