import { followsTable, usersTable } from "@/db/schema";
import { getImageUrlFromR2 } from "@/features/r2";
import { AppLoadContext } from "@remix-run/cloudflare";
import { InferSelectModel } from "drizzle-orm";

export async function serializeFollowerUser(
  context: AppLoadContext,
  user: InferSelectModel<typeof usersTable>,
  currentUser: InferSelectModel<typeof usersTable> & {
    followers: {
      follower: InferSelectModel<typeof usersTable>;
    }[];
    followees: InferSelectModel<typeof followsTable>[];
  }
) {
  const imageUrl = await getImageUrlFromR2(context, user.imageS3Key);
  return {
    id: user.id,
    name: user.name,
    imageUrl: imageUrl || user.icon,
    isFollowee: currentUser.followees.some(
      ({ followeeId }) => followeeId === user.id
    ),
    isFollower: currentUser.followers.some(
      ({ follower: { id } }) => id === user.id
    ),
    createdAt: user.createdAt,
    // updatedAt: user.updatedAt,
  };
}

export async function serializeFolloweeUser(
  context: AppLoadContext,
  user: InferSelectModel<typeof usersTable>,
  currentUser: InferSelectModel<typeof usersTable> & {
    followers: InferSelectModel<typeof followsTable>[];
    followees: {
      followee: InferSelectModel<typeof usersTable>;
    }[];
  }
) {
  const imageUrl = await getImageUrlFromR2(context, user.imageS3Key);
  return {
    id: user.id,
    name: user.name,
    imageUrl: imageUrl || user.icon,
    isFollowee: currentUser.followees.some(
      ({ followee: { id } }) => id === user.id
    ),
    isFollower: currentUser.followers.some(
      ({ followerId }) => followerId === user.id
    ),
    createdAt: user.createdAt,
    // updatedAt: user.updatedAt,
  };
}
