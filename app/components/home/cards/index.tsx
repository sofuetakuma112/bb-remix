import { PostCard } from "@/components/card";
import { SerializedPost } from "@/features/serializers/post";
import { SerializeFrom } from "@remix-run/cloudflare";

type CardsProps = {
  currentUserId: string;
  posts: SerializeFrom<SerializedPost[]>;
};

export function Cards({ currentUserId, posts }: CardsProps) {
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
