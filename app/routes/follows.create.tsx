import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getDBClient } from "@/lib/client.server";
import { followsTable } from "@/db/schema";
import { getAuthenticator } from "@/services/auth.server";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser || !currentUser.id) return redirect("/login");

  if (currentUser) {
    const db = getDBClient(context.cloudflare.env.DB);
    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();
    if (userId == null) {
      return new Response("userId is required", { status: 400 });
    }
    await db.insert(followsTable).values({
      followeeId: userId,
      followerId: currentUser.id,
    });
  }
  return null;
};
