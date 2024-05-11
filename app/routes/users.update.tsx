import {
  ActionFunctionArgs,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { getDBClient } from "@/lib/client.server";
import { usersTable } from "@/db/schema";
import { getAuthenticator } from "@/services/auth.server";
import { eq } from "drizzle-orm";
import { uploadImageToS3 } from "@/features/r2";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser || !currentUser.id) return redirect("/login");

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
      key = await uploadImageToS3(context, file, "posts");
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
