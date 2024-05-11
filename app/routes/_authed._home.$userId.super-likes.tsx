import { Cards } from "@/components/home/cards";
import { getLikePosts } from "@/features/drizzle/get/like";
import { getDBClient } from "@/lib/client.server";
import { getAuthenticator } from "@/services/auth.server";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  if (!params.userId) throw new Response("userId is required", { status: 400 });

  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser || !currentUser.id) return redirect("/login");

  const db = getDBClient(context.cloudflare.env.DB);
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
