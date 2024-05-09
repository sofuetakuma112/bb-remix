import { captureRemixErrorBoundaryError } from "@sentry/remix";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import stylesheet from "@/tailwind.css?url";
import { IconDefs } from "@/features/ui/icon/IconDefs";
import { LinksFunction } from "@remix-run/cloudflare";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const ErrorBoundary = () => {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <div>Something went wrong</div>;
};

export default function App() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <IconDefs />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

// export default function App() {
//   return <Outlet />;
// }