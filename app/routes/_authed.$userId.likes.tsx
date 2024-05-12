import { PostCard } from "@/components/card";
import { getServerAuthSession } from "@/features/auth";
import { getLikePosts } from "@/features/drizzle/get/like";
import { SerializedLikedPost } from "@/features/serializers/like";
import { Button } from "@/features/ui/button";
import { Icon } from "@/features/ui/icon";
import { getDBClient } from "@/lib/client.server";
import {
  LoaderFunctionArgs,
  SerializeFrom,
  json,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  if (!params.userId) throw new Response("userId is required", { status: 400 });

  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  return json(
    await getLikePosts(db, context, params.userId, currentUser.id, "like")
  );
};

export default function LikesPage() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col items-center pb-[100px] pt-5">
      {/*Todo: onClickでフォロー/アンフォロー処理を実装するならcomponentで切る*/}
      <Button variant="ghost" className="border-amber-400">
        <Icon name="like-white" width="28" height="28" />
      </Button>
      <h1 className="mt-4 h-8 w-[168px] text-center text-2xl font-semibold">
        いいね一覧
      </h1>
      <div className="mt-12">
        <Cards posts={posts} />
      </div>
    </div>
  );
}

type CardsProps = {
  posts: SerializeFrom<SerializedLikedPost[]>;
};
function Cards({ posts }: CardsProps) {
  return (
    <div className="grid gap-x-16 gap-y-9 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 2xl:grid-cols-4">
      {posts.map((post) => (
        <PostCard
          postId={post.id}
          pageType="likes"
          userId={post.user.id}
          key={post.userId}
          imageUrl={post.imageUrl ?? ""}
          imageName={post.imageName}
          profileUrl={post.user.imageUrl ?? ""}
          userName={post.user.name ?? ""}
          analysisResult={post.analysisResult}
          hashTags={post.hashTags as string[]}
          prompt={post.prompt}
        />
      ))}
    </div>
  );
}
