import { Authenticator } from "remix-auth";
import {
  AppLoadContext,
  createCookieSessionStorage,
} from "@remix-run/cloudflare";
import { GoogleStrategy } from "remix-auth-google";
import { eq } from "drizzle-orm";
import { usersTable } from "@/db/schema";
import { getDBClient } from "@/lib/client.server";

export type User = {
  id: string;
  name: string;
  image?: string;
};

let _authenticatedUser: Authenticator<User> | null = null;

export function getAuthenticator(context: AppLoadContext) {
  if (_authenticatedUser === null) {
    const sessionStorage = createCookieSessionStorage({
      cookie: {
        name: "_session", // use any name you want here
        sameSite: "lax", // this helps with CSRF
        path: "/", // remember to add this so the cookie will work in all routes
        httpOnly: true, // for security reasons, make this cookie http only
        secrets: [context.cloudflare.env.AUTH_SECRET], // replace this with an actual secret
        secure: import.meta.env.PROD, // enable this in prod only
      },
    });
    _authenticatedUser = new Authenticator<User>(sessionStorage);
    const googleStrategy = new GoogleStrategy(
      {
        clientID: context.cloudflare.env.GOOGLE_CLIENT_ID,
        clientSecret: context.cloudflare.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${context.cloudflare.env.GOOGLE_CALLBACK_BASE_URL}/auth/google/callback`,
      },
      async ({ accessToken, refreshToken, extraParams, profile }) => {
        console.log("profile:", profile);
        const db = getDBClient(context.cloudflare.env.DB);
        const exitsUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.providerId, profile.id))
          .limit(1);
        if (exitsUser.length === 0) {
          const createUser = await db
            .insert(usersTable)
            .values({
              provider: profile.provider,
              providerId: profile.id,
              name: profile.displayName,
              icon: profile.photos[0].value,
            })
            .returning()
            .get();
          return {
            id: createUser.id,
            name: createUser.name,
            image: createUser.icon ?? undefined,
          };
        }
        return { id: exitsUser[0].id, name: exitsUser[0].name };
      }
    );
    _authenticatedUser.use(googleStrategy);
  }
  return _authenticatedUser;
}
