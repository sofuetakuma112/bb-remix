import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { getDBClient } from "@/lib/client.server";
import { followsTable } from "@/db/schema";
import { User } from "@/services/auth.server";
import { getServerAuthSession } from "@/features/auth";
import { and, eq } from "drizzle-orm";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const user = (await getServerAuthSession(context, request)) as User;
  if (user) {
    const db = getDBClient(context.cloudflare.env.DB);
    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();
    if (userId == null) {
      return new Response("userId is required", { status: 400 });
    }
    const follow = await db.query.followsTable.findFirst({
      where: and(
        eq(followsTable.followeeId, userId),
        eq(followsTable.followerId, user.id)
      ),
    });

    if (!follow) {
      return new Response("Follow not found", { status: 404 });
    }

    await db.delete(followsTable).where(eq(followsTable.id, follow.id));
  }
  return null;
};
