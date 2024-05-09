import { AppLoadContext } from "@remix-run/cloudflare";
import { v4 as uuidv4 } from "uuid";
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const createS3Client = (context: AppLoadContext) =>
  new S3Client({
    endpoint: context.cloudflare.env.R2_ENDPOINT_URL,
    region: "auto",
    credentials: {
      accessKeyId: context.cloudflare.env.R2_ACCESS_KEY_ID,
      secretAccessKey: context.cloudflare.env.R2_SECRET_ACCESS_KEY,
    },
  });

type S3ImageType = "avatars" | "posts";

// // S3に画像をアップロードする
async function uploadImageToS3(
  context: AppLoadContext,
  file: File,
  type: S3ImageType
): Promise<string> {
  const key = `${type}/${uuidv4()}`;

  const arrayBuffer = await file.arrayBuffer();
  const body = new Uint8Array(arrayBuffer);

  const params = {
    Bucket: context.cloudflare.env.BUCKET_NAME,
    Key: key,
    Body: body,
  };
  const command = new PutObjectCommand(params);

  try {
    const client = createS3Client(context);
    await client.send(command);
  } catch (err) {
    console.error(err);
  }

  return key;
}

async function getImageUrlFromS3(
  context: AppLoadContext,
  s3Key: string | null
) {
  if (!s3Key) return "";

  if (s3Key.startsWith("http") || s3Key.startsWith("https")) {
    return s3Key;
  }

  const client = createS3Client(context);
  const params = {
    Bucket: context.cloudflare.env.BUCKET_NAME,
    Key: s3Key,
  };
  const command = new GetObjectCommand(params);
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return url;
}

export { getImageUrlFromS3, uploadImageToS3 };
