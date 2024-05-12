import { colors } from "@/lib/console";
import { AppLoadContext, json } from "@remix-run/cloudflare";
import { v4 as uuidv4 } from "uuid";
// import {
//   PutObjectCommand,
//   GetObjectCommand,
//   S3Client,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const createS3Client = (context: AppLoadContext) =>
//   new S3Client({
//     endpoint: context.cloudflare.env.R2_ENDPOINT_URL,
//     region: "auto",
//     credentials: {
//       accessKeyId: context.cloudflare.env.R2_ACCESS_KEY_ID,
//       secretAccessKey: context.cloudflare.env.R2_SECRET_ACCESS_KEY,
//     },
//   });

type S3ImageType = "avatars" | "posts";

// // S3に画像をアップロードする
async function uploadImageToS3(
  context: AppLoadContext,
  file: File,
  type: S3ImageType
): Promise<string> {
  const key = `${type}/${uuidv4()}`;

  const arrayBuffer = await file.arrayBuffer();
  // const body = new Uint8Array(arrayBuffer);

  // const params = {
  //   Bucket: context.cloudflare.env.BUCKET_NAME,
  //   Key: key,
  //   Body: body,
  // };
  // const command = new PutObjectCommand(params);

  // try {
  //   const client = createS3Client(context);
  //   await client.send(command);
  // } catch (err) {
  //   console.error(err);
  // }

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

  // const client = createS3Client(context);
  // const params = {
  //   Bucket: context.cloudflare.env.BUCKET_NAME,
  //   Key: key,
  // };
  // const command = new GetObjectCommand(params);
  // const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  // return url;

  // const object = await context.cloudflare.env.R2.get(key);

  // if (object === null) {
  //   throw json({ message: "Object not found" }, { status: 404 });
  // }

  return `/images/${key}`
}

export { getImageUrlFromS3, uploadImageToS3 };
