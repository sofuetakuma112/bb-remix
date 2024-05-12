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

  const key = await uploadImageToR2(context, submission.value.file, "posts");

  const imageName = submission.value.imageName;
  const imageAge = submission.value.imageAge;
  const prompt = submission.value.prompt;
  const hashtag = submission.value.hashtag;

  const trimmedHashtags =
    hashtag == null
      ? undefined
      : hashtag
          .trim()
          .split("#")
          .filter((tag) => tag !== "")
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
