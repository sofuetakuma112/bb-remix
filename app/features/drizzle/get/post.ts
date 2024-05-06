import { likesTable, postsTable, usersTable } from "@/db/schema";
import { getImageUrlFromS3 } from "@/features/r2";
import { DrizzleClient } from "@/features/types/drizzle";
import {
  SerializedPost,
  SerializedUser,
} from "@/features/types/serializer/post";
import { AppLoadContext } from "@remix-run/cloudflare";
import {
  eq,
  desc,
  and,
  not,
  notInArray,
  InferSelectModel,
  isNull,
} from "drizzle-orm";

export async function getUserPosts(
  db: DrizzleClient,
  context: AppLoadContext,
  userId: string
) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!user[0]) {
    throw new Response("User not found", { status: 404 });
  }

  const posts = await db.query.postsTable.findMany({
    where: (postsTable, { eq, and, or }) =>
      and(
        eq(postsTable.userId, userId),
        or(
          isNull(postsTable.analysisResult),
          eq(postsTable.analysisResult, true)
        )
      ),
    with: {
      user: true,
      likes: {
        where: (likesTable, { eq }) => eq(likesTable.likeType, "super_like"),
        limit: 1,
        with: {
          user: true,
        },
      },
    },
  });

  return {
    posts: await Promise.all(posts.map((post) => serializePost(context, post))),
  };
}

export async function getRecommendedPosts(
  db: DrizzleClient,
  context: AppLoadContext,
  userId: string
) {
  const likePostIds = (
    await db.query.likesTable.findMany({
      where: eq(likesTable.userId, userId),
      columns: { postId: true },
    })
  ).map((like) => like.postId);

  const recommendedPost = await db.query.postsTable.findFirst({
    where: and(
      eq(postsTable.analysisResult, true),
      not(eq(postsTable.userId, userId)),
      likePostIds.length > 0
        ? notInArray(postsTable.id, likePostIds)
        : undefined
    ),
    orderBy: desc(postsTable.id),
    with: {
      user: true,
      likes: {
        where: (likesTable, { eq }) => eq(likesTable.likeType, "super_like"),
        orderBy: desc(likesTable.createdAt),
        limit: 1,
        with: {
          user: true,
        },
      },
    },
  });

  if (!recommendedPost) {
    return { post: null };
  }

  return { post: await serializePost(context, recommendedPost) };
}

async function serializePost(
  context: AppLoadContext,
  post: InferSelectModel<typeof postsTable> & {
    user: InferSelectModel<typeof usersTable>;
    likes: InferSelectModel<typeof likesTable>[];
  }
): Promise<SerializedPost> {
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
