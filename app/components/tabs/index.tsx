import { Link, useLocation } from "@remix-run/react";
import { Tabs, TabsList, TabsTrigger } from "@/features/ui/tabs";
import { SerializeFrom } from "@remix-run/cloudflare";
import { SerializedLikedPost } from "@/features/serializers/like";
import { SerializedPost } from "@/features/serializers/post";

type TabProps = {
  userId: string;
  posts: SerializeFrom<SerializedPost[]>;
  superLikePosts: SerializeFrom<SerializedLikedPost[]>;
};

export default function Tab({
  userId,
  posts,
  superLikePosts,
}: Readonly<TabProps>) {
  const location = useLocation();
  const pathname = location.pathname;
  const selectedTab = pathname.split("/")[2];
  return (
    <Tabs
      defaultValue={selectedTab}
      style={{ height: "100%" }}
      className="mt-8 h-10 w-full max-w-[1072px] border-b-2 sm:mt-[64px]"
    >
      <div className="flex h-10">
        <TabsList className="flex gap-[48px]" variant="text">
          <TabsTrigger value="home" variant="profileText">
            <Link to={`/${userId}/home`} className="flex gap-8">
              <p>投稿</p>
              <p>{posts.length}</p>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="super-likes" variant="profileText">
            <Link to={`/${userId}/super-likes`} className="flex gap-8">
              <p>スーパーライク</p>
              <p>{superLikePosts.length}</p>
            </Link>
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}
