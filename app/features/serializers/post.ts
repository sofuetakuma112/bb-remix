import { postsTable, usersTable, likesTable } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { SerializedUser } from "@/features/types/serializer/like";
import { SerializedPost } from "@/features/types/serializer/post";
import { getImageUrlFromS3 } from "@/features/r2";

export async function serializePost(
  post: InferSelectModel<typeof postsTable> & {
    user: InferSelectModel<typeof usersTable>;
    likes: InferSelectModel<typeof likesTable>[];
  }
): Promise<SerializedPost> {
  const imageUrl = await getImageUrlFromS3(post.imageS3Key);

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
    user: await serializeUser(post.user),
  };
}

export async function serializeUser(
  user: InferSelectModel<typeof usersTable>
): Promise<SerializedUser> {
  const imageUrl = await getImageUrlFromS3(user.imageS3Key);

  return {
    id: user.id,
    name: user.name,
    imageUrl: imageUrl || user.icon,
  };
}
