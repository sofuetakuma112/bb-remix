import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getServerAuthSession } from "@/features/auth";
import { getDBClient } from "@/lib/client.server";

export const meta: MetaFunction = () => {
  return [
    { title: "BeauBelle" },
    {
      name: "description",
      content: "AIで生成 した 美女 の画像をシェアする新たな SNS",
    },
  ];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const db = getDBClient(context.cloudflare.env.DB);
  await getServerAuthSession(db, context, request);

  return redirect("/home");
};

export default function Index() {
  useLoaderData<typeof loader>();

  return <></>;
}
