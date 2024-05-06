import { Button } from '@/features/ui/button';
import { Icon } from '@/features/ui/icon';

type RemoveLikeButtonProps = {
  userId: string;
  postId: string;
};

export default function RemoveLikeButton({ userId, postId }: RemoveLikeButtonProps) {
  return (
    <Button
      variant="likeDelete"
      className="absolute right-1 top-1"
      // unLike
      onClick={() => console.log(userId, postId)}
    >
      <Icon name="trash-can" width="28" height="28" />
    </Button>
  );
}
