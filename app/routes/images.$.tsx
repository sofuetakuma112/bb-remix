import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({ context, params }) => {
  // URLパラメーターを取得
  const key = params["*"];
  if (!key) {
    return json({ message: "key is requreid" }, { status: 400 });
  }

  // URLパラメーターをKeyにR2オブジェクトを取得
  const object = await context.cloudflare.env.R2.get(key);

  if (object === null) {
    return json({ message: "Object not found" }, { status: 404 });
  }

  const blob = await object.blob();

  // R2オブジェクトのメタデータからheaderを生成
  const headers: HeadersInit = new Headers();
  headers.set("contentType", blob.type.split("/").pop() ?? "");
  headers.set("etag", object.etag);

  // オブジェクトを返す
  return new Response(blob, { headers });
};
