import clsx from "clsx";
import { Link, useFetcher } from "@remix-run/react";
import { Button } from "@/features/ui/button";
import { Card } from "@/features/ui/card";

type Props = {
  profileUrl: string;
  userId: string;
  userName: string;
  isFollowee: boolean;
  className?: string;
};

function UserCard({
  profileUrl,
  userId,
  userName,
  isFollowee,
  className,
}: Props) {
  const fetcher = useFetcher();

  return (
    <Card
      variant="list"
      color="white"
      className={clsx("flex-col overflow-hidden", className)}
    >
      <div className="h-[256px]">
        {/* TODO: Imageコンポーネントに置き換える */}
        <Link to={`/${userId}/home`}>
          <img
            src={profileUrl}
            alt="ユーザープロフィール画像"
            className="size-full object-cover"
          />
        </Link>
      </div>
      <div className="px-2 pb-4 pt-1">
        <Link to={`/${userId}/home`}>
          <p className="text-black-black pb-3 text-2xl font-semibold">
            {userName}
          </p>
        </Link>
        <div className="flex justify-center">
          {isFollowee ? (
            <fetcher.Form action="/follows/delete" method="post">
              <input type="hidden" name="userId" value={userId} />
              <Button
                type="submit"
                variant="following"
                font="bold"
                className="text-black-black"
              >
                フォロー中
              </Button>
            </fetcher.Form>
          ) : (
            <fetcher.Form action="/follows/create" method="post">
              <input type="hidden" name="userId" value={userId} />
              <Button
                type="submit"
                variant="follow"
                font="bold"
                className="text-white-white"
              >
                フォロー
              </Button>
            </fetcher.Form>
          )}
        </div>
      </div>
    </Card>
  );
}

export { UserCard };
