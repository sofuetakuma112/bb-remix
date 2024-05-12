import { User, getAuthenticator } from "@/services/auth.server";
import { AppLoadContext, redirect } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { usersTable } from "@/db/schema";
import { DrizzleClient } from "@/features/types/drizzle";

export const getServerAuthSession = async (
  db: DrizzleClient,
  context: AppLoadContext,
  request: Request
): Promise<User> => {
  const { authenticator, getSession, destroySession } =
    getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser || !currentUser.id) throw redirect("/login");

  const foundUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, currentUser.id),
  });
  if (foundUser == null && getSession != null && destroySession != null) {
    // セッション破棄して/loginにリダイレクト
    const session = await getSession(request.headers.get("Cookie"));
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  return currentUser;
};
