import clsx from "clsx";
import { Link, useFetcher } from "@remix-run/react";
import { Button } from "@/features/ui/button";

type Props = {
  profileUrl: string;
  userId: string;
  userName: string;
  isFollowee: boolean;
  className?: string;
};

function UserItem({
  profileUrl,
  userId,
  userName,
  isFollowee,
  className,
}: Props) {
  const fetcher = useFetcher();

  return (
    <div
      className={clsx(
        "flex w-full justify-between gap-y-2 overflow-hidden",
        className
      )}
    >
      <div className="flex">
        <div className="mr-2 size-8 overflow-hidden rounded-full">
          {/* TODO: Imageコンポーネントに置き換える */}
          <Link to={`/${userId}/home`}>
            <img
              src={profileUrl}
              alt="ユーザープロフィール画像"
              className="size-full object-cover"
            />
          </Link>
        </div>
        <Link to={`/${userId}/home`} className="flex items-center">
          <p className="text-black-black pb-3 text-lg font-semibold">
            {userName}
          </p>
        </Link>
      </div>
      <div className="flex justify-center">
        {isFollowee ? (
          <fetcher.Form action="/follows/delete" method="post">
            <input type="hidden" name="userId" value={userId} />
            <Button
              variant="following"
              font="bold"
              className="text-black-black mt-2"
            >
              フォロー中
            </Button>
          </fetcher.Form>
        ) : (
          <fetcher.Form action="/follows/create" method="post">
            <input type="hidden" name="userId" value={userId} />
            <Button
              variant="follow"
              font="bold"
              className="text-white-white mt-2"
            >
              フォロー
            </Button>
          </fetcher.Form>
        )}
      </div>
    </div>
  );
}

export { UserItem };
