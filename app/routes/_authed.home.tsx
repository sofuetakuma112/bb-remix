import { SwipeCards } from "@/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/ui/tabs";
import { getAuthenticator } from "@/services/auth.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { getDBClient } from "@/lib/client.server";
import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import {
  getFollowingPosts,
  getRecommendedPosts,
} from "@/features/drizzle/get/post";
import { like } from "@/features/drizzle/mutation/like";
import { getServerAuthSession } from "@/features/auth";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  const userId = currentUser.id;

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "recommend";
  const { post } =
    type === "recommend"
      ? await getRecommendedPosts(db, context, userId)
      : await getFollowingPosts(db, context, userId);

  return json(post);
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const { authenticator } = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser || !currentUser.id) return redirect("/login");

  const userId = currentUser.id;

  const formData = await request.formData();
  const postId = formData.get("postId") as string;
  const likeType = formData.get("likeType") as string;

  const db = getDBClient(context.cloudflare.env.DB);
  await like(db, userId, postId, likeType);

  return null;
};

export default function HomePage() {
  const post = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const location = useLocation();
  const query = location.search;
  const params = new URLSearchParams(query);
  const tabValue = params.get("type") ?? "recommend";

  return (
    <div className="h-full px-2 sm:px-8">
      {/* TODO: classNameでheight: 100%;を指定できるようにする */}
      <Tabs
        defaultValue="recommend"
        style={{ height: "100%" }}
        className="flex flex-col"
      >
        <div className="flex h-16 sm:flex-1 items-center sm:max-h-[calc(100%-48px-785px-20px)] sm:min-h-[calc(48px+16px_*_2)] sm:py-4">
          <TabsList className="mx-auto flex justify-center" variant="text">
            <TabsTrigger
              value="recommend"
              variant="text"
              onClick={() => navigate(`/home?type=recommend`)}
            >
              おすすめ
            </TabsTrigger>
            <div className="mx-4 min-h-full w-0.5 bg-gray-300"></div>
            <TabsTrigger
              value="following"
              variant="text"
              onClick={() => navigate(`/home?type=following`)}
            >
              フォロー中
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="h-full max-h-[calc(100%-64px-64px)] flex-1 sm:max-h-full mx-auto">
          <TabsContent
            value={tabValue}
            variant="text"
            className="h-full flex-col items-center"
          >
            <SwipeCards tabValue={tabValue} post={post} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
