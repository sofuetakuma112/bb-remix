import { Outlet, useLoaderData } from "@remix-run/react";
import { Header } from "@/components/header";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { getServerAuthSession } from "@/features/auth";
import { User } from "@/services/auth.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const currentUser = (await getServerAuthSession(context, request)) as User;
  return json(currentUser);
};

export default function App() {
  const currentUser = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen">
      <Header user={currentUser} />
      <main className="relative h-screen flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
