import { PostCard } from "@/components/card";
import Profile from "@/components/profile/profile";
import Tab from "@/components/tabs";
import { getServerAuthSession } from "@/features/auth";
import { getSuperLikePosts } from "@/features/drizzle/get/like";
import { getUserPosts } from "@/features/drizzle/get/post";
import { getUser } from "@/features/drizzle/get/user";
import type { SerializedPost } from "@/features/types/serializer/post";
import { getDBClient } from "@/lib/client.server";
import { User } from "@/services/auth.server";
import { LoaderFunctionArgs, SerializeFrom, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  if (!params.userId) throw new Response("userId is required", { status: 400 });

  const currentUser = (await getServerAuthSession(context, request)) as User;

  const db = getDBClient(context.cloudflare.env.DB);

  const [userPostsResponse, userResponse, superLikePostsResponse] =
    await Promise.all([
      getUserPosts(db, context, params.userId),
      getUser(db, params.userId),
      getSuperLikePosts(db, context, params.userId, currentUser.id),
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
      <div className="text-left">
        <Profile
          profileUrl={user.imageUrl ?? ""}
          currentUserId={currentUser.id}
          userId={user.id}
          userName={user.name ?? ""}
          followerCount={user.followerCount}
          followingCount={user.followingCount}
          isFollowee={user.isFollowee}
        />
      </div>
      <Tab userId={user.id} posts={posts} superLikePosts={superLikePosts} />
      <div className="flex flex-col pt-4 sm:pb-[100px] sm:pt-9">
        <Cards currentUserId={currentUser.id} posts={posts} />
      </div>
    </div>
  );
}

type CardsProps = {
  currentUserId: string;
  posts: SerializeFrom<SerializedPost[]>;
};

function Cards({ currentUserId, posts }: CardsProps) {
  return (
    <div className="mt-4 grid w-full gap-x-16 gap-y-9 pb-16 sm:mt-7 sm:w-auto sm:pb-0 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {posts.map((post) => (
        <PostCard
          postId={post.id}
          imageUrl={post.imageUrl ?? ""}
          imageName={post.imageName}
          analysisResult={post.analysisResult}
          profileUrl={post.user.imageUrl ?? ""}
          currentUserId={currentUserId}
          userId={post.user.id}
          userName={post.user.name ?? ""}
          key={post.id}
          hashTags={post.hashTags as string[]}
          prompt={post.prompt}
        />
      ))}
    </div>
  );
}
