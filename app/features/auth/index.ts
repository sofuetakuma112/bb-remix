import { User, getAuthenticator } from "@/services/auth.server";
import { AppLoadContext, TypedResponse, redirect } from "@remix-run/cloudflare";

// export const getServerAuthSession = async (
//   context: AppLoadContext,
//   request: Request
// ): Promise<User | TypedResponse<never>> => {
//   const authenticator = getAuthenticator(context);
//   const user = await authenticator.isAuthenticated(request);
//   if (!user || !user.id) return redirect("/login");

//   return user;
// };
