import { likesTable, postsTable, usersTable } from "@/db/schema";
import { getImageUrlFromS3 } from "@/features/r2";
import { AppLoadContext } from "@remix-run/cloudflare";
import { InferSelectModel } from "drizzle-orm";

export async function serializeLike(
  context: AppLoadContext,
  like: InferSelectModel<typeof likesTable> & {
    post: InferSelectModel<typeof postsTable> & {
      user: InferSelectModel<typeof usersTable>;
      likes: InferSelectModel<typeof likesTable>[];
    };
  }
) {
  const imageUrl = await getImageUrlFromS3(context, like.post.imageS3Key);

  return {
    id: like.post.id,
    prompt: like.post.prompt,
    imageUrl,
    analysisResult: like.post.analysisResult,
    likeCount: like.post.likes.filter((l) => l.likeType === "like").length,
    superLikeCount: like.post.likes.filter((l) => l.likeType === "super_like")
      .length,
    userId: like.post.userId,
    hashTags: like.post.hashTags,
    imageName: like.post.imageName,
    imageAge: like.post.imageAge,
    imageBirthplace: like.post.imageBirthplace,
    user: await serializeUser(context, like.post.user),
    superLikeUser: like.likeType === "super_like" ? like.post.user : null,
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

export type SerializedLikedPost = Awaited<ReturnType<typeof serializeLike>>;
export type SerializedUser = Awaited<ReturnType<typeof serializeUser>>;