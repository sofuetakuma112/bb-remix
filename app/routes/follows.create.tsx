import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { getDBClient } from "@/db/client.server";
import { followsTable } from "@/db/schema";
import { getServerAuthSession } from "@/features/auth";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  if (currentUser) {
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
