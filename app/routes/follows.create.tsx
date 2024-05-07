import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { getDBClient } from "@/lib/client.server";
import { followsTable } from "@/db/schema";
import { User } from "@/services/auth.server";
import { getServerAuthSession } from "@/features/auth";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const user = (await getServerAuthSession(context, request)) as User;
  if (user) {
    const db = getDBClient(context.cloudflare.env.DB);
    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();
    if (userId == null) {
      return new Response("userId is required", { status: 400 });
    }
    await db.insert(followsTable).values({
      followeeId: userId,
      followerId: user.id,
    });
  }
  return null;
};
