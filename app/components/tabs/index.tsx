import { useLocation, useNavigate } from "@remix-run/react";
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

  const navigate = useNavigate();
  return (
    <Tabs
      defaultValue={selectedTab}
      style={{ height: "100%" }}
      className="mt-8 h-10 w-full max-w-[1072px] border-b-2 sm:mt-[64px]"
    >
      <div className="flex h-10">
        <TabsList className="flex gap-[48px]" variant="text">
          <TabsTrigger value="home" variant="profileText" onClick={() => navigate(`/${userId}/home`)}>
            <p className="flex gap-8">
              <p>投稿</p>
              <p>{posts.length}</p>
            </p>
          </TabsTrigger>
          <TabsTrigger value="super-likes" variant="profileText" onClick={() => navigate(`/${userId}/super-likes`)}>
            <p className="flex gap-8">
              <p>スーパーライク</p>
              <p>{superLikePosts.length}</p>
            </p>
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}
