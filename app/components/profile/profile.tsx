import { useState } from "react";
import EditProfile from "@/components/profile/editProfile";
import { Button } from "@/features/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/features/ui/dialog";
import { useFetcher } from "@remix-run/react";

type EditProfileDialogProps = {
  currentUserId?: string;
  userId: string;
  userName: string;
  profileUrl: string;
};

function EditProfileDialog({
  currentUserId,
  userId,
  userName,
  profileUrl,
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {userId === currentUserId ? (
        <DialogTrigger asChild>
          <button onClick={() => setOpen(true)}>
            <img
              src={profileUrl}
              alt="AI画像"
              className="size-full object-cover"
            />
          </button>
        </DialogTrigger>
      ) : (
        <img src={profileUrl} alt="AI画像" className="size-full object-cover" />
      )}

      <DialogContent className="px-0 py-4">
        <EditProfile
          userId={userId}
          userName={userName}
          close={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

type UserProfileProps = {
  profileUrl: string;
  currentUserId?: string;
  userId: string;
  userName: string;
  followerCount: number;
  followingCount: number;
  isFollowee: boolean;
};

export default function Profile({
  profileUrl,
  currentUserId,
  userId,
  userName,
  followerCount,
  followingCount,
  isFollowee,
}: UserProfileProps) {
  const fetcher = useFetcher();
  return (
    <>
      <div className="size-16 overflow-hidden rounded-lg sm:size-20">
        <EditProfileDialog
          currentUserId={currentUserId}
          userId={userId}
          userName={userName}
          profileUrl={profileUrl}
        />
      </div>
      <h1 className="mt-2 text-2xl font-medium sm:h-12 sm:text-4xl">
        {userName}
      </h1>
      {/*Todo: 認証が入ったら修正, フォロー、フォロー中も*/}
      {userId !== currentUserId && isFollowee && (
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
      )}
      {userId !== currentUserId && !isFollowee && (
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

      <div className="sm:t-7 mt-4 flex gap-8">
        <div>
          <p className="text-lg font-medium sm:text-xl">{followerCount}</p>
          <p className="text-sm font-medium sm:text-base">フォロワー</p>
        </div>
        <div>
          <p className="text-lg font-medium sm:text-xl">{followingCount}</p>
          <p className="text-sm font-medium sm:text-base">フォロー</p>
        </div>
      </div>
    </>
  );
}
