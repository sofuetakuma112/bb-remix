import { AppLoadContext } from "@remix-run/cloudflare";
import { v4 as uuidv4 } from "uuid";

type S3ImageType = "avatars" | "posts";

async function uploadImageToR2(
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

  return key;
}

async function getImageUrlFromR2(context: AppLoadContext, key: string | null) {
  if (!key) return "";

  if (key.startsWith("http") || key.startsWith("https")) {
    return key;
  }

  return `/images/${key}`
}

export { getImageUrlFromR2, uploadImageToR2 };
