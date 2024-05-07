import { followsTable, likesTable, postsTable, usersTable } from "@/db/schema";
import { serializePost } from "@/features/serializers/post";
import { DrizzleClient } from "@/features/types/drizzle";
import { AppLoadContext } from "@remix-run/cloudflare";
import {
  eq,
  desc,
  and,
  not,
  notInArray,
  isNull,
  inArray,
  or,
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

export async function getFollowingPosts(
  db: DrizzleClient,
  context: AppLoadContext,
  currentUserId: string
) {
  // フォローしているユーザーIDの配列を取得
  const followingUserIds = (
    await db.query.followsTable.findMany({
      where: eq(followsTable.followerId, currentUserId),
      columns: { followeeId: true },
    })
  ).map((follow) => follow.followeeId);
  const hasFollowingUserId = followingUserIds.length > 0;

  if (!hasFollowingUserId) {
    // フォローしているユーザーがいない場合、表示するpostは無い
    return { post: null };
  }

  // フォローしているユーザーがスーパーライクしたPostのIDの配列を取得
  const superLikePostIds = (
    await db.query.likesTable.findMany({
      where: and(
        followingUserIds.length > 0
          ? inArray(likesTable.userId, followingUserIds)
          : undefined,
        eq(likesTable.likeType, "super_like")
      ),
      columns: { postId: true },
      // distinctOn: likesTable.postId,
    })
  ).map((like) => like.postId);
  const hasSuperLikePostId = superLikePostIds.length > 0;

  // ログインユーザーがいいね/スーパーライクしたPostのIDの配列を取得
  const myLikesPostIds = (
    await db.query.likesTable.findMany({
      where: eq(likesTable.userId, currentUserId),
      columns: { postId: true },
    })
  ).map((like) => like.postId);
  const hasMyLikesPostId = myLikesPostIds.length > 0;

  // フォロー中ユーザーの投稿でかつ、自分がlike, unlike, super_likeしていない投稿
  const followingPost = await db.query.postsTable.findFirst({
    where: and(
      eq(postsTable.analysisResult, true),
      inArray(postsTable.userId, followingUserIds),
      or(
        hasSuperLikePostId
          ? not(inArray(postsTable.id, superLikePostIds))
          : undefined,
        not(eq(postsTable.userId, currentUserId)),
        hasMyLikesPostId
          ? not(inArray(postsTable.id, myLikesPostIds))
          : undefined
      )
    ),
    orderBy: desc(postsTable.id),
    with: {
      user: true,
      likes: {
        where: eq(likesTable.likeType, "super_like"),
        orderBy: desc(likesTable.createdAt),
        limit: 1,
        with: {
          user: true,
        },
      },
    },
  });

  // フォロー中ユーザーがスーパーライクして、かつ自分がlike, unlike, super_likeしていない投稿
  const superLikedPost = await db.query.postsTable.findFirst({
    where: and(
      eq(postsTable.analysisResult, true),
      hasSuperLikePostId ? inArray(postsTable.id, superLikePostIds) : undefined,
      or(
        not(eq(postsTable.userId, currentUserId)),
        hasMyLikesPostId
          ? not(inArray(postsTable.id, myLikesPostIds))
          : undefined
      )
    ),
    orderBy: desc(postsTable.id),
    with: {
      user: true,
      likes: {
        where: eq(likesTable.likeType, "super_like"),
        orderBy: desc(likesTable.createdAt),
        limit: 1,
        with: {
          user: true,
        },
      },
    },
  });

  const posts = [followingPost, superLikedPost].flatMap((post) =>
    post == null ? [] : [post]
  );

  if (posts.length === 0) {
    return { post: null };
  }

  return {
    post: await serializePost(context, posts[0]),
  };
}
