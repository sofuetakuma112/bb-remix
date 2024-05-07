import Upload from "@/components/publishPost/upload";
import { Icon } from "@/features/ui/icon";
import {
  ActionFunctionArgs,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { getServerAuthSession } from "@/features/auth";
import { User } from "@/services/auth.server";
import { postsTable } from "@/db/schema";
import { getDBClient } from "@/lib/client.server";
import { uploadImageToS3 } from "@/features/r2";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const currentUser = (await getServerAuthSession(context, request)) as User;
  const userId = currentUser.id;

  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 1024 * 1024 * 10,
  });
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("file") as File;
  const key = await uploadImageToS3(context, file, "posts");
  //   const response = await context.cloudflare.env.R2.put(
  //     `posts/${uuidv4()}`,
  //     file,
  //     {
  //       httpMetadata: {
  //         contentType: file.type,
  //       },
  //     }
  //   );

  const imageName = formData.get("imageName") as string;
  const imageAge = formData.get("imageAge") as string;
  const prompt = formData.get("prompt") as string;
  const hashtag = formData.get("hashtag") as string;

  const trimed = hashtag.trim();
  const hashtags = trimed.split("#").filter((tag) => tag !== "");
  const trimmedHashtags = hashtags
    .map((tag) => tag.trim())
    .map((hashtag) => `#${hashtag}`);

  const db = getDBClient(context.cloudflare.env.DB);
  await db.insert(postsTable).values({
    imageS3Key: key,
    // base64Image: `data:image/${file.name
    //   .split(".")
    //   .pop()};base64,${arrayBufferToBase64(await file.arrayBuffer())}`,
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
  return (
    <div className="pb-16 sm:pb-0">
      <Upload />
      <Icon
        name="bee"
        className="mx-auto size-full max-h-[215px] max-w-[444px]"
      />
    </div>
  );
}