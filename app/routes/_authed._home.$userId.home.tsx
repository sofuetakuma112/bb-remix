import { Cards } from "@/components/home/cards";
import { getServerAuthSession } from "@/features/auth";
import { getUserPosts } from "@/features/drizzle/get/post";
import { getDBClient } from "@/lib/client.server";
import { User } from "@/services/auth.server";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  if (!params.userId) throw new Response("userId is required", { status: 400 });

  const currentUser = (await getServerAuthSession(context, request)) as User;

  const db = getDBClient(context.cloudflare.env.DB);
  const { posts } = await getUserPosts(db, context, params.userId);

  return json({ posts, currentUser });
};

export default function HomePage() {
  const { posts, currentUser } = useLoaderData<typeof loader>();

  return <Cards currentUserId={currentUser.id} posts={posts} />;
}
