import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { getDBClient } from "@/db/client.server";
import { followsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
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
