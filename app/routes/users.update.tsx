import {
  ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { getDBClient } from "@/lib/client.server";
import { usersTable } from "@/db/schema";
import { User } from "@/services/auth.server";
import { getServerAuthSession } from "@/features/auth";
import { eq } from "drizzle-orm";
import { uploadImageToS3 } from "@/features/r2";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const user = (await getServerAuthSession(context, request)) as User;
  if (user) {
    const db = getDBClient(context.cloudflare.env.DB);

    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: 1024 * 1024 * 10,
    });
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );

    const userName = formData.get("userName")?.toString();
    if (!userName) {
        return new Response("userName is required", { status: 404 });
    }

    const file = formData.get("file") as File;
    const key = await uploadImageToS3(context, file, "posts");

    const foundUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, user.id),
    });

    if (!foundUser) {
      return new Response("User not found", { status: 404 });
    }

    await db
      .update(usersTable)
      .set({
        name: userName ?? foundUser.name,
        imageS3Key: key,
      })
      .where(eq(usersTable.id, user.id));
  }
  return null;
};
