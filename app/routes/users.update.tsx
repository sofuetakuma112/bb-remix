import {
  ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { getDBClient } from "@/db/client.server";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { uploadImageToR2 } from "@/features/r2";
import { getServerAuthSession } from "@/features/auth";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  if (currentUser) {
    const db = getDBClient(context.cloudflare.env.DB);

    const foundUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, currentUser.id),
    });
    if (!foundUser) {
      return new Response("User not found", { status: 404 });
    }

    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: 1024 * 1024 * 10,
    });
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );

    const file = formData.get("file") as File;

    let key;
    if (file.size !== 0) {
      key = await uploadImageToR2(context, file, "avatars");
    }

    const userName = formData.get("userName")?.toString();
    if (!userName) {
      return new Response("userName is required", { status: 404 });
    }

    if (userName === foundUser.name && !key) {
      return null;
    }

    await db
      .update(usersTable)
      .set({
        name: userName ?? foundUser.name,
        imageS3Key: key,
      })
      .where(eq(usersTable.id, currentUser.id));
  }
  return null;
};

export function handleError(error: unknown) {
  console.log(error);
}
