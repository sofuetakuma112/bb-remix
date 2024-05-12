import { Authenticator } from "remix-auth";
import {
  AppLoadContext,
  createCookieSessionStorage,
} from "@remix-run/cloudflare";
import { GoogleStrategy } from "remix-auth-google";
import { getDBClient } from "@/db/client.server";
import { createUserIfNotExists } from "@/features/drizzle/auth";

export type User = {
  id: string;
  name: string;
  image?: string;
};

let _authenticatedUser: Authenticator<User> | null = null;
let getSession: ReturnType<typeof createCookieSessionStorage>["getSession"];
// let commitSession: ReturnType<typeof createCookieSessionStorage>["commitSession"];
let destroySession: ReturnType<typeof createCookieSessionStorage>["destroySession"];

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
    getSession = sessionStorage.getSession;
    // commitSession = sessionStorage.commitSession;
    destroySession  = sessionStorage.destroySession

    _authenticatedUser = new Authenticator<User>(sessionStorage);

    const googleStrategy = new GoogleStrategy(
      {
        clientID: context.cloudflare.env.GOOGLE_CLIENT_ID,
        clientSecret: context.cloudflare.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${context.cloudflare.env.GOOGLE_CALLBACK_BASE_URL}/auth/google/callback`,
      },
      async ({ accessToken, refreshToken, extraParams, profile }) => {
        const db = getDBClient(context.cloudflare.env.DB);
        const currentUser = await createUserIfNotExists(db, profile);
        return {
          id: currentUser.id,
          name: currentUser.name,
          image: currentUser.icon ?? undefined,
        };
      }
    );
    _authenticatedUser.use(googleStrategy);
  }
  return { authenticator: _authenticatedUser, getSession, destroySession };
}
