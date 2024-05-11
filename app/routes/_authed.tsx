import { Outlet, useLoaderData } from "@remix-run/react";
import { Header } from "@/components/header";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { getServerAuthSession } from "@/features/auth";
import { User } from "@/services/auth.server";
import { getDBClient } from "@/lib/client.server";
import { getCurerntUser } from "@/features/drizzle/get/user";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const user = (await getServerAuthSession(context, request)) as User;

  const db = getDBClient(context.cloudflare.env.DB);

  const currentUser = await getCurerntUser(db, context, user.id);
  return json(currentUser);
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
