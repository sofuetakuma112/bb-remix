import {
  followsTable,
  likesTable,
  notificationsTable,
  postsTable,
  usersTable,
} from "@/db/schema";
import { getImageUrlFromS3 } from "@/features/r2";
import { DrizzleClient } from "@/features/types/drizzle";
import { InferSelectModel, eq } from "drizzle-orm";

export async function getUser(db: DrizzleClient, userId: string) {
  const [user, currentUser] = await Promise.all([
    db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
      with: {
        posts: true,
        likes: true,
        followers: true,
        followees: true,
      },
    }),
    db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
      with: {
        notifications: true,
        followers: true,
        followees: true,
      },
    }),
  ]);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  if (!currentUser) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return {
    user: await serializeUser(user, currentUser),
  };
}

async function serializeUser(
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
  const imageUrl = await getImageUrlFromS3(user.imageS3Key);
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
