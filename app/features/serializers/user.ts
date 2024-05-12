import {
  followsTable,
  likesTable,
  notificationsTable,
  postsTable,
  usersTable,
} from "@/db/schema";
import { getImageUrlFromR2 } from "@/features/r2";
import { AppLoadContext } from "@remix-run/cloudflare";
import { InferSelectModel } from "drizzle-orm";

export async function serializeUser(
  context: AppLoadContext,
  user: InferSelectModel<typeof usersTable> & {
    posts: InferSelectModel<typeof postsTable>[];
    likes: InferSelectModel<typeof likesTable>[];
    followers: InferSelectModel<typeof followsTable>[];
    followees: InferSelectModel<typeof followsTable>[];
  },
  currentUser: InferSelectModel<typeof usersTable> & {
    followers: InferSelectModel<typeof followsTable>[];
    followees: InferSelectModel<typeof followsTable>[];
    notifications: InferSelectModel<typeof notificationsTable>[];
  }
) {
  const imageUrl = await getImageUrlFromR2(context, user.imageS3Key);

  return {
    id: user.id,
    name: user.name,
    imageUrl: imageUrl || user.icon,
    isFollowee: currentUser.followees.some(
      (followee) => followee.followeeId === user.id
    ),
    isFollower: currentUser.followers.some(
      (follower) => follower.followerId === user.id
    ),
    unreadNotificationCount:
      user.id === currentUser.id
        ? currentUser.notifications.filter((n) => !n.read).length
        : undefined,
    postCount: user.posts.filter(
      (p) => p.analysisResult === true || p.analysisResult === null
    ).length,
    likeCount: user.likes.filter((l) => l.likeType === "like").length,
    superLikeCount: user.likes.filter((l) => l.likeType === "super_like")
      .length,
    followerCount: user.followers.length,
    followingCount: user.followees.length,
    createdAt: user.createdAt,
  };
}

export async function serializeCurrentUser(
  context: AppLoadContext,
  currentUser: InferSelectModel<typeof usersTable>
) {
  const imageUrl = await getImageUrlFromR2(context, currentUser.imageS3Key);

  return {
    id: currentUser.id,
    name: currentUser.name,
    imageUrl: imageUrl || currentUser.icon,
  };
}

export type SerializedCurrentUser = Awaited<ReturnType<typeof serializeCurrentUser>>;