import clsx from "clsx";
import { useAtom } from "jotai";
import { Link, useFetcher } from "@remix-run/react";
import { SkeletonCard } from "@/components/card";
import {
  followingCurrentScrollIndexAtom,
  recommendCurrentScrollIndexAtom,
} from "@/features/atoms/swipeCards";
import { Badge } from "@/features/ui/badge";
import { Button } from "@/features/ui/button";
import { Card } from "@/features/ui/card";
import { Icon } from "@/features/ui/icon";
import { SerializeFrom } from "@remix-run/cloudflare";
import { SerializedPost } from "@/features/serializers/post";

const commonClasses = {
  profileImage: "size-9 overflow-hidden rounded-lg",
  userName: "text-base text-black-black",
  superLikeIcon: "flex items-center",
  reload: "bg-white-white",
  scrollButton: "bg-white-white",
  scrollIcon: "size-[18px] sm:size-[28px]",
  hashTags: "inline-flex flex-wrap gap-x-3 gap-y-6 pt-9",
  promptText:
    "mt-9 rounded-2xl bg-white p-6 text-xl font-semibold text-slate-800",
};

const buttonVariants = {
  smOutline: "bg-white-white",
  lgOutline: "bg-white-white",
};

type SwipeCardProps = {
  imageUrl: string;
  name: string;
  age: number;
  profileUrl: string;
  userName: string;
  userId: string;
  postId: string;
  hashTags: string[];
  prompt: string;
  isSuperLikePost: boolean;
  currentScrollIndex: number;
  handleReload: () => void;
  handleScroll: (type: "up" | "down") => void;
};

function SwipeCardForPC({
  imageUrl,
  name,
  age,
  profileUrl,
  userName,
  userId,
  postId,
  hashTags,
  prompt,
  isSuperLikePost,
  currentScrollIndex,
  handleReload,
  handleScroll,
}: SwipeCardProps) {
  const fetcher = useFetcher();
  return (
    <Card
      variant="single"
      color={isSuperLikePost ? "superlike" : "blue"}
      className="relative h-full flex-col sm:max-h-[785px] hidden sm:flex"
    >
      {/* User profile */}
      <div
        className={clsx("absolute left-8 top-6 z-10 hidden sm:flex", {
          block: currentScrollIndex === 0,
          hidden: currentScrollIndex > 0,
        })}
      >
        <Link to={`/${userId}/home`}>
          <div className="mr-1 size-9 overflow-hidden rounded-lg">
            <img
              src={profileUrl}
              alt="ユーザープロフィール画像"
              className="size-full object-cover"
            />
          </div>
        </Link>
        <div className="flex items-center">
          <Link to={`/${userId}/home`}>
            <span className={commonClasses.userName}>{userName}</span>
          </Link>
        </div>
      </div>

      {/* Superlike badge */}
      <div
        className={clsx(
          "absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 sm:block",
          {
            block: currentScrollIndex === 0,
            hidden: currentScrollIndex > 0,
          }
        )}
      >
        {isSuperLikePost && (
          <div className={commonClasses.superLikeIcon}>
            <Icon name="super-like" width="32" height="32" />
            <span className="pl-2 text-sm font-bold text-blue-300">
              superlikeされた投稿です！！
            </span>
          </div>
        )}
      </div>

      {/* Reload button */}
      <div
        className={clsx(
          "absolute right-2 top-2 z-10 hidden sm:right-8 sm:top-6 sm:block",
          {
            block: currentScrollIndex === 0,
            hidden: currentScrollIndex > 0,
          }
        )}
      >
        <Button
          variant="smOutline"
          className={commonClasses.reload}
          onClick={handleReload}
        >
          <Icon name="reload" width="32" height="32" />
        </Button>
      </div>

      {/* Scroll up button */}
      <div
        className={clsx(
          "absolute left-1/2 top-[10%] z-10 hidden -translate-x-1/2 sm:block",
          {
            "sm:hidden": currentScrollIndex === 0,
          }
        )}
      >
        <Button
          variant="ghost"
          className={commonClasses.scrollButton}
          onClick={() => handleScroll("up")}
        >
          <Icon
            name="arrow-down"
            className={`${commonClasses.scrollIcon} rotate-180`}
          />
        </Button>
      </div>

      {/* Scroll down button */}
      <div
        className={clsx(
          "absolute bottom-[15%] left-1/2 z-10 hidden -translate-x-1/2 sm:block",
          {
            "sm:hidden": currentScrollIndex === 2,
          }
        )}
      >
        <Button
          variant="ghost"
          className={commonClasses.scrollButton}
          onClick={() => handleScroll("down")}
        >
          <Icon name="arrow-down" className={commonClasses.scrollIcon} />
        </Button>
      </div>

      {/* Image and user info */}
      <div className="hidden h-full overflow-y-hidden rounded-3xl sm:block">
        <div
          className={clsx("flex h-full transition-transform duration-500", {
            "translate-y-0": currentScrollIndex === 0,
            "-translate-y-full": currentScrollIndex === 1,
            "translate-y-[-200%]": currentScrollIndex === 2,
          })}
        >
          <div className="flex-1">
            <img
              src={imageUrl}
              alt="AI画像"
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="my-auto">
              <span className="pr-4 text-5xl text-white-white">{name}</span>
              <span className="text-4xl text-white-white">{age}</span>
            </div>
          </div>
        </div>

        {/* Hashtags */}
        <div
          className={clsx(
            "flex h-full flex-col items-center justify-center px-8 transition-transform duration-500 xl:px-32",
            {
              "-translate-y-full": currentScrollIndex === 1,
              "translate-y-[-200%]": currentScrollIndex === 2,
            }
          )}
        >
          <p className="text-center text-2xl font-bold">ハッシュタグ</p>
          <div className={commonClasses.hashTags}>
            {hashTags.map((hashTag, i) => (
              <Badge key={`${imageUrl}-${hashTag}-${i}`}>{hashTag}</Badge>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div
          className={clsx(
            "flex h-full flex-col items-center justify-center px-8 transition-transform duration-500 xl:px-32",
            {
              "-translate-y-full": currentScrollIndex === 1,
              "translate-y-[-200%]": currentScrollIndex === 2,
            }
          )}
        >
          <p className="text-center text-2xl font-bold">プロンプト</p>
          <p className={commonClasses.promptText}>{prompt}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute -bottom-8 left-1/2 hidden -translate-x-1/2 gap-x-16 sm:-bottom-12 sm:flex">
        <fetcher.Form method="post">
          <input name="postId" type="hidden" value={postId} />
          <input name="likeType" type="hidden" value="unlike" />
          <Button
            type="submit"
            variant="lgOutline"
            className={buttonVariants.lgOutline}
            // onClick={handleNope}
          >
            <Icon name="nope" className="size-8 sm:size-16" />
          </Button>
        </fetcher.Form>

        <fetcher.Form method="post">
          <input name="postId" type="hidden" value={postId} />
          <input name="likeType" type="hidden" value="super_like" />
          <Button
            type="submit"
            variant="lgOutline"
            className={buttonVariants.lgOutline}
            // onClick={handleSuperLike}
          >
            <Icon name="super-like" className="size-8 sm:size-16" />
          </Button>
        </fetcher.Form>

        <fetcher.Form method="post">
          <input name="postId" type="hidden" value={postId} />
          <input name="likeType" type="hidden" value="like" />
          <Button
            type="submit"
            variant="lgOutline"
            className={buttonVariants.lgOutline}
            // onClick={handleLike}
          >
            <Icon name="like" className="size-8 sm:size-16" />
          </Button>
        </fetcher.Form>
      </div>
    </Card>
  );
}

function SwipeCardForSP({
  imageUrl,
  name,
  age,
  profileUrl,
  userName,
  userId,
  postId,
  hashTags,
  prompt,
  isSuperLikePost,
  currentScrollIndex,
  handleReload,
}: Omit<SwipeCardProps, "handleScroll">) {
  const fetcher = useFetcher();
  return (
    <Card
      variant="single"
      color={isSuperLikePost ? "superlike" : "blue"}
      className="relative flex h-full flex-col sm:max-h-[785px] sm:hidden"
    >
      {/* Image and user info */}
      <div className="scrollbar-hide h-full overflow-y-scroll rounded-3xl">
        <div className="relative flex h-full">
          <div className="flex-1">
            <img
              src={imageUrl}
              alt="AI画像"
              className="size-full object-cover"
            />
          </div>
          <div className="absolute bottom-4 left-4 sm:hidden">
            <span className="pr-4 text-2xl font-semibold text-white">
              {name}
            </span>
            <span className="text-xl font-semibold text-white">{age}</span>
          </div>

          {/* User profile */}
          <div
            className={clsx("absolute left-4 top-4 z-10 flex", {
              block: currentScrollIndex === 0,
              hidden: currentScrollIndex > 0,
            })}
          >
            <Link to={`/${userId}/home`}>
              <div className={commonClasses.profileImage}>
                <img
                  src={profileUrl}
                  alt="ユーザープロフィール画像"
                  className="size-full object-cover"
                />
              </div>
            </Link>
            <div className="flex items-center">
              <Link to={`/${userId}/home`}>
                <span className="text-base text-white">{userName}</span>
              </Link>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute bottom-2 right-2 flex gap-x-2 sm:hidden">
            <fetcher.Form method="post">
              <input name="postId" type="hidden" value={postId} />
              <input name="likeType" type="hidden" value="unlike" />
              <Button
                type="submit"
                variant="smOutline"
                className={buttonVariants.smOutline}
                // onClick={handleNope}
              >
                <Icon name="nope" className="size-6" />
              </Button>
            </fetcher.Form>

            <fetcher.Form method="post">
              <input name="postId" type="hidden" value={postId} />
              <input name="likeType" type="hidden" value="super_like" />
              <Button
                type="submit"
                variant="smOutline"
                className={buttonVariants.smOutline}
                // onClick={handleSuperLike}
              >
                <Icon name="super-like" className="size-6" />
              </Button>
            </fetcher.Form>

            <fetcher.Form method="post">
              <input name="postId" type="hidden" value={postId} />
              <input name="likeType" type="hidden" value="like" />
              <Button
                type="submit"
                variant="smOutline"
                className={buttonVariants.smOutline}
                // onClick={handleLike}
              >
                <Icon name="like" className="size-6" />
              </Button>
            </fetcher.Form>
          </div>

          {/* Superlike badge */}
          <div
            className={clsx("absolute left-4 top-14 z-10 sm:hidden", {
              block: currentScrollIndex === 0,
              hidden: currentScrollIndex > 0,
            })}
          >
            {isSuperLikePost && (
              <div className={commonClasses.superLikeIcon}>
                <Icon name="super-like" width="32" height="32" />
                <span className="pl-2 text-sm font-bold text-blue-300">
                  superlikeされた投稿です！！
                </span>
              </div>
            )}
          </div>

          {/* Reload button */}
          <div
            className={clsx("absolute right-2 top-2 z-10 sm:hidden", {
              block: currentScrollIndex === 0,
              hidden: currentScrollIndex > 0,
            })}
          >
            <Button
              variant="smOutline"
              className={commonClasses.reload}
              onClick={handleReload}
            >
              <Icon name="reload" width="32" height="32" />
            </Button>
          </div>
        </div>

        {/* Hashtags */}
        <div className="flex h-full flex-col items-center justify-center px-8">
          <p className="text-center text-2xl font-bold">ハッシュタグ</p>
          <div className={commonClasses.hashTags}>
            {hashTags.map((hashTag, i) => (
              <Badge key={`${imageUrl}-${hashTag}-${i}`}>{hashTag}</Badge>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="flex h-full flex-col items-center px-2 pt-4 sm:px-8 sm:pt-8">
          <p className="text-center text-2xl font-bold">プロンプト</p>
          <p className="mt-9 rounded-2xl bg-white p-6 text-base font-semibold text-slate-800 sm:text-xl">
            {prompt}
          </p>
        </div>
      </div>
    </Card>
  );
}

// type TopPagePosts = {
//   recommended: Awaited<
//     ReturnType<
//       Awaited<ReturnType<typeof client.api.posts.recommended.$get>>["json"]
//     >
//   >;
//   followings: Awaited<
//     ReturnType<
//       Awaited<ReturnType<typeof client.api.posts.followings.$get>>["json"]
//     >
//   >;
// };

// async function fetcher(type: keyof TopPagePosts) {
//   let res;
//   if (type === "recommended") {
//     client.api.posts.recommended.$get();
//     res = await client.api.posts.recommended.$get();
//   } else if (type === "followings") {
//     res = await client.api.posts.followings.$get();
//   }

//   if (!res) {
//     throw Error("invalid type");
//   }

//   return res.json();
// }

// type LikeType = "like" | "super_like" | "unlike";

function NoCard() {
  return (
    <div className="flex h-full items-center justify-center text-xl">
      表示する女性がいません
    </div>
  );
}

type SwipeCardsProps = {
  tabValue: string;
  post: SerializeFrom<SerializedPost> | null;
};

function SwipeCards({ tabValue, post }: SwipeCardsProps) {
  const [currentScrollIndex, setCurrentScrollIndex] = useAtom(
    tabValue === "recommend"
      ? recommendCurrentScrollIndexAtom
      : followingCurrentScrollIndexAtom
  );

  const mutate = () => {
    console.log("mutate!");
  };

  if (post == null) {
    return <SkeletonCard />;
  }

  const currentPost = post;
  if (!currentPost) return <NoCard />;

  const handleReload = () => {
    // TODO: リロード処理を実装する
    mutate();
    // handleSetCurrentIndex(0);
  };
  const handleScroll = (type: "up" | "down") => {
    // 現在のカードに基づいて次のカードを表示
    setCurrentScrollIndex((current) =>
      type === "up" ? current - 1 : current + 1
    );
  };

  return (
    <>
      <SwipeCardForPC
        imageUrl={currentPost.imageUrl ?? ""}
        name={currentPost.imageName}
        age={Number(currentPost.imageAge)}
        profileUrl={currentPost.user.imageUrl ?? ""}
        userName={currentPost.user.name ?? ""}
        userId={currentPost.user.id}
        postId={currentPost.id}
        hashTags={currentPost.hashTags as string[]}
        prompt={currentPost.prompt}
        isSuperLikePost={Number(currentPost.superLikeCount) > 0}
        currentScrollIndex={currentScrollIndex}
        handleReload={handleReload}
        handleScroll={handleScroll}
      />
      <SwipeCardForSP
        imageUrl={currentPost.imageUrl ?? ""}
        name={currentPost.imageName}
        age={Number(currentPost.imageAge)}
        profileUrl={currentPost.user.imageUrl ?? ""}
        userName={currentPost.user.name ?? ""}
        userId={currentPost.user.id}
        postId={currentPost.id}
        hashTags={currentPost.hashTags as string[]}
        prompt={currentPost.prompt}
        isSuperLikePost={Number(currentPost.superLikeCount) > 0}
        currentScrollIndex={currentScrollIndex}
        handleReload={handleReload}
      />
    </>
  );
}

export { SwipeCards };
