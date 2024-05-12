import { Outlet, useLoaderData } from "@remix-run/react";
import { Header } from "@/components/header";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { getDBClient } from "@/db/client.server";
import { getCurerntUser } from "@/features/drizzle/get/user";
import { getServerAuthSession } from "@/features/auth";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const db = getDBClient(context.cloudflare.env.DB);
  const currentUser = await getServerAuthSession(db, context, request);
  
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
