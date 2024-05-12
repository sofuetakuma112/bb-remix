import {
  ActionFunctionArgs,
  json,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { getDBClient } from "@/db/client.server";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { uploadImageToR2 } from "@/features/r2";
import { getServerAuthSession } from "@/features/auth";
import { parseWithZod } from "@conform-to/zod";
import { schema } from "@/features/formSchemas/editProfile";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  if (currentUser) {
    const db = getDBClient(context.cloudflare.env.DB);

    const foundUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, currentUser.id),
    });
    if (!foundUser) {
      return json({ message: "user not found" }, { status: 404 });
    }

    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: 1024 * 1024 * 10,
    });
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );

    const submission = parseWithZod(formData, { schema });
    if (submission.status !== "success") {
      return json(submission.reply());
    }

    const file = submission.value.file;

    let key;
    if (file && file.size !== 0) {
      key = await uploadImageToR2(context, file, "avatars");
    }

    const userName = submission.value.name;

    if (userName === foundUser.name && !key) {
      return json({ message: "no changed" }, { status: 200 });
    }

    await db
      .update(usersTable)
      .set({
        name: userName ?? foundUser.name,
        imageS3Key: key,
      })
      .where(eq(usersTable.id, currentUser.id));
  }
  return json(
    { message: "user profile successfully updated" },
    { status: 200 }
  );
};

export function handleError(error: unknown) {
  console.log(error);
}
