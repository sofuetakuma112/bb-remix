import { UserCard } from "@/components/card";
import { UserItem } from "@/components/item";
import { getServerAuthSession } from "@/features/auth";
import { SerializeFollowerUser, getFollowers } from "@/features/drizzle/get/follow";
import { Button } from "@/features/ui/button";
import { Icon } from "@/features/ui/icon";
import { getDBClient } from "@/lib/client.server";
import { User } from "@/services/auth.server";
import { LoaderFunctionArgs, SerializeFrom, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  if (!params.userId) throw new Response("userId is required", { status: 400 });

  const currentUser = (await getServerAuthSession(context, request)) as User;

  const db = getDBClient(context.cloudflare.env.DB);
  return json(await getFollowers(db, context, params.userId, currentUser.id));
};

export default function FollowingPage() {
  const { followers } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col items-center pb-[100px] pt-5">
      {/*Todo: onClickでフォロー/アンフォロー処理を実装するならcomponentで切る*/}
      <Button variant="ghost" className="border-amber-400">
        <Icon name="follow-white" width="32" height="32" />
      </Button>
      <h1 className="mb-4 mt-2 h-8 w-[168px] text-center text-xl font-semibold sm:mb-8 sm:mt-4 sm:text-2xl">
        フォロワー一覧
      </h1>
      <Cards followers={followers} />
    </div>
  );
}

type CardsProps = {
  followers: SerializeFrom<SerializeFollowerUser[]>;
};

function Cards({ followers }: CardsProps) {
  return (
    <div className="w-full gap-x-16 gap-y-9 px-4 sm:grid sm:w-auto sm:grid-cols-2 sm:px-8 lg:grid-cols-3 2xl:grid-cols-4">
      {followers.map((followee) => (
        <>
          <UserCard
            profileUrl={followee.imageUrl ?? ""}
            userId={followee.id}
            userName={followee.name ?? ""}
            isFollowee={followee.isFollowee}
            key={followee.id}
            className="hidden sm:block"
          />
          <UserItem
            profileUrl={followee.imageUrl ?? ""}
            userId={followee.id}
            userName={followee.name ?? ""}
            isFollowee={followee.isFollowee}
            key={followee.id}
            className="sm:hidden"
          />
        </>
      ))}
    </div>
  );
}
