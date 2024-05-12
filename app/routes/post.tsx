import Upload from "@/components/publishPost/upload";
import { Icon } from "@/features/ui/icon";
import {
  ActionFunctionArgs,
  json,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { postsTable } from "@/db/schema";
import { getDBClient } from "@/db/client.server";
import { uploadImageToR2 } from "@/features/r2";
import { useActionData } from "@remix-run/react";
import { getServerAuthSession } from "@/features/auth";

import { parseWithZod } from "@conform-to/zod";
import { schema } from "@/features/formSchemas/post";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  const userId = currentUser.id;

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

  const file = formData.get("file") as File;
  const key = await uploadImageToR2(context, file, "posts");

  const imageName = formData.get("imageName") as string;
  const imageAge = formData.get("imageAge") as string;
  const prompt = formData.get("prompt") as string;
  const hashtag = formData.get("hashtag") as string;

  const trimed = hashtag.trim();
  const hashtags = trimed.split("#").filter((tag) => tag !== "");
  const trimmedHashtags = hashtags
    .map((tag) => tag.trim())
    .map((hashtag) => `#${hashtag}`);

  await db.insert(postsTable).values({
    imageS3Key: key,
    imageName,
    imageAge,
    prompt,
    hashTags: trimmedHashtags,
    userId,
    analysisResult: true,
  });

  return redirect(`/${userId}/home`);
};

export default function FormPage() {
  const lastResult = useActionData<typeof action>();

  return (
    <div className="pb-16 sm:pb-0">
      <Upload lastResult={lastResult} />
      <Icon
        name="bee"
        className="mx-auto size-full max-h-[215px] max-w-[444px]"
      />
    </div>
  );
}
