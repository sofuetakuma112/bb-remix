import { Cards } from "@/components/home/cards";
import { getServerAuthSession } from "@/features/auth";
import { getLikePosts } from "@/features/drizzle/get/like";
import { getDBClient } from "@/db/client.server";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  if (!params.userId) throw new Response("userId is required", { status: 400 });

  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  const { posts } = await getLikePosts(
    db,
    context,
    params.userId,
    currentUser.id,
    "super_like"
  );

  return json({ posts, currentUser });
};

export default function HomePage() {
  const { posts, currentUser } = useLoaderData<typeof loader>();

  return <Cards currentUserId={currentUser.id} posts={posts} />;
}
