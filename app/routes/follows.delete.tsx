import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getDBClient } from "@/lib/client.server";
import { followsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthenticator } from "@/services/auth.server";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser || !currentUser.id) return redirect("/login")

  if (currentUser) {
    const db = getDBClient(context.cloudflare.env.DB);
    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();
    if (userId == null) {
      return new Response("userId is required", { status: 400 });
    }
    const follow = await db.query.followsTable.findFirst({
      where: and(
        eq(followsTable.followeeId, userId),
        eq(followsTable.followerId, currentUser.id)
      ),
    });

    if (!follow) {
      return new Response("Follow not found", { status: 404 });
    }

    await db.delete(followsTable).where(eq(followsTable.id, follow.id));
  }
  return null;
};
