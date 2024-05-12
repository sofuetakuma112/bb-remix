import Profile from "@/components/profile/profile";
import Tab from "@/components/tabs";
import { getServerAuthSession } from "@/features/auth";
import { getLikePosts } from "@/features/drizzle/get/like";
import { getUserPosts } from "@/features/drizzle/get/post";
import { getUser } from "@/features/drizzle/get/user";
import { getDBClient } from "@/db/client.server";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  if (!params.userId) throw new Response("userId is required", { status: 400 });

  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  const [userPostsResponse, userResponse, superLikePostsResponse] =
    await Promise.all([
      getUserPosts(db, context, params.userId),
      getUser(db, context, params.userId, currentUser.id),
      getLikePosts(db, context, params.userId, currentUser.id, "super_like"),
    ]);

  const { posts } = userPostsResponse;
  const { user } = userResponse;
  const { posts: superLikePosts } = superLikePostsResponse;

  return json({ posts, superLikePosts, user, currentUser });
};

export default function HomePage() {
  const { posts, superLikePosts, user, currentUser } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col px-4 pt-4 sm:px-12 sm:pb-[100px] sm:pt-9">
      <Profile
        profileUrl={user.imageUrl ?? ""}
        currentUserId={currentUser.id}
        userId={user.id}
        userName={user.name}
        followerCount={user.followerCount}
        followingCount={user.followingCount}
        isFollowee={user.isFollowee}
      />
      <Tab userId={user.id} posts={posts} superLikePosts={superLikePosts} />
      <div className="flex flex-col pt-4 sm:pb-[100px] sm:pt-9">
        <Outlet />
      </div>
    </div>
  );
}
