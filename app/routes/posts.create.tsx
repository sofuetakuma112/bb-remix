import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getDBClient } from "@/lib/client.server";
import { postsTable } from "@/db/schema";
import { getAuthenticator } from "@/services/auth.server";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    const db = getDBClient(context.cloudflare.env.DB)
    const formData = await request.formData()
    const postBody = formData.get("post-body")?.toString()
    // validation
    if (postBody === undefined || postBody.length === 0) {
      return new Response("Post body is empty", { status: 500 })
    }
    await db.insert(postsTable).values({ body: postBody?.toString(), userId: user.id })
  }
  return redirect("/")
};