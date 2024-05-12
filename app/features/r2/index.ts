import { colors } from "@/lib/console";
import { AppLoadContext } from "@remix-run/cloudflare";
import { v4 as uuidv4 } from "uuid";

type S3ImageType = "avatars" | "posts";

async function uploadImageToS3(
  context: AppLoadContext,
  file: File,
  type: S3ImageType
): Promise<string> {
  const key = `${type}/${uuidv4()}`;

  const arrayBuffer = await file.arrayBuffer();

  await context.cloudflare.env.R2.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  console.log(colors.red + "key:", key + colors.reset);

  return key;
}

async function getImageUrlFromS3(context: AppLoadContext, key: string | null) {
  if (!key) return "";

  if (key.startsWith("http") || key.startsWith("https")) {
    return key;
  }

  return `/images/${key}`
}

export { getImageUrlFromS3, uploadImageToS3 };
