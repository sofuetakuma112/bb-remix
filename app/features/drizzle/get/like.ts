import { likesTable, postsTable, usersTable } from "@/db/schema";
import { getImageUrlFromS3 } from "@/features/r2";
import { DrizzleClient } from "@/features/types/drizzle";
import {
  SerializedLikedPost,
  SerializedUser,
} from "@/features/types/serializer/like";
import { AppLoadContext } from "@remix-run/cloudflare";
import { eq, and, desc, InferSelectModel } from "drizzle-orm";

export async function getSuperLikePosts(
  db: DrizzleClient,
  context: AppLoadContext,
  userId: string,
  currentUserId: string
) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const posts = await db.query.postsTable.findMany({
    where: eq(postsTable.analysisResult, true),
    with: {
      user: true,
      likes: {
        where: and(
          eq(likesTable.userId, currentUserId),
          eq(likesTable.likeType, "super_like")
        ),
        orderBy: desc(likesTable.createdAt),
        limit: 1,
        with: {
          user: true,
        },
      },
    },
  });

  //   if (searchString) {
  //     posts = posts.filter(
  //       (post) =>
  //         post.hashTags &&
  //         Array.isArray(post.hashTags) &&
  //         post.hashTags.includes(searchString)
  //     );
  //   }

  return {
    posts: await Promise.all(posts.map((post) => serializePost(context, post))),
  };
}

async function serializePost(
  context: AppLoadContext,
  post: InferSelectModel<typeof postsTable> & {
    user: InferSelectModel<typeof usersTable>;
    likes: (InferSelectModel<typeof likesTable> & {
      user: InferSelectModel<typeof usersTable>;
    })[];
  }
): Promise<SerializedLikedPost> {
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
    superLikeUser: post.likes[0]?.user ?? null,
  };
}

async function serializeUser(
  context: AppLoadContext,
  user: InferSelectModel<typeof usersTable>
): Promise<SerializedUser> {
  const imageUrl = await getImageUrlFromS3(context, user.imageS3Key);

  return {
    id: user.id,
    name: user.name,
    imageUrl: imageUrl || user.icon,
  };
}
