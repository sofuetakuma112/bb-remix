import { Button } from "@/features/ui/button";
import { Icon } from "@/features/ui/icon";
import { useFetcher } from "@remix-run/react";

type RemoveLikeButtonProps = {
  postId: string;
};

export default function RemoveLikeButton({ postId }: RemoveLikeButtonProps) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form action="/likes/unlike" method="post">
      <input type="hidden" name="postId" value={postId} />
      <Button
        type="submit"
        variant="likeDelete"
        className="absolute right-1 top-1"
      >
        <Icon name="trash-can" width="28" height="28" />
      </Button>
    </fetcher.Form>
  );
}
