import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "@/features/ui/button";
import { Icon } from "@/features/ui/icon";
import {
  LoaderFunctionArgs,
  SerializeFrom,
  json,
} from "@remix-run/cloudflare";
import { getDBClient } from "@/lib/client.server";
import { convertToJST } from "@/lib/date";
import { getNotifications } from "@/features/drizzle/get/notification";
import { SerializedNotifierUser } from "@/features/serializers/notification";
import { getServerAuthSession } from "@/features/auth";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);

  return json(await getNotifications(db, context, currentUser.id));
};

export default function NotificationsPage() {
  const { notifications } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col items-center pt-5">
      <Button variant="ghost" className="border-amber-400">
        <Icon name="notification-white" width="28" height="28" />
      </Button>
      <h1 className="mt-4 h-8 w-[168px] text-center text-xl font-semibold sm:text-2xl">
        通知
      </h1>
      <div className="mt-4 w-full px-4 sm:mt-8 sm:px-0">
        {notifications.map((notification) => {
          return (
            <UserStatus
              key={notification.id}
              notificationType={notification.notificationType}
              notifierUser={notification.notifierUser}
              createdAt={notification.createdAt.toString()}
            />
          );
        })}
      </div>
    </div>
  );
}

type UserStatusProps = {
  notificationType: string;
  notifierUser: SerializeFrom<SerializedNotifierUser>;
  createdAt: string;
};

function UserStatus({
  notificationType,
  notifierUser,
  createdAt,
}: UserStatusProps) {
  const userDetailPagePath = `/${notifierUser.id}/home`;
  const userName = <Link to={userDetailPagePath}>{notifierUser.name}</Link>;

  return (
    <div className="mx-auto mt-2 flex w-full max-w-[400px] items-center justify-between gap-x-4">
      <div className="flex gap-x-2">
        <Link to={userDetailPagePath}>
          <div className="size-8 overflow-hidden rounded-sm sm:size-12">
            <img
              className="size-full object-cover"
              src={notifierUser.imageUrl ?? ""}
              alt="userImage"
            />
          </div>
        </Link>
        {notificationType === "like" ? (
          <p className="flex items-center">{userName}にいいねされました</p>
        ) : notificationType === "follow" ? (
          <p className="flex items-center">{userName}にフォローされました</p>
        ) : notificationType === "super_like" ? (
          <p className="flex items-center">
            {userName}にスーパーライクされました
          </p>
        ) : null}
      </div>
      <p className="text-gray-300">{convertToJST(createdAt)}</p>
    </div>
  );
}
