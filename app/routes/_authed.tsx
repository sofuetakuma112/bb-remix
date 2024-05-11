import { Outlet, useLoaderData } from "@remix-run/react";
import { Header } from "@/components/header";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "@/services/auth.server";
import { getDBClient } from "@/lib/client.server";
import { getCurerntUser } from "@/features/drizzle/get/user";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser || !currentUser.id) return redirect("/login");

  const db = getDBClient(context.cloudflare.env.DB);

  const fetchedCurrentUser = await getCurerntUser(db, context, currentUser.id);
  return json(fetchedCurrentUser);
};

export default function App() {
  const { user: currentUser } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen">
      <Header user={currentUser} />
      <main className="relative h-screen flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
