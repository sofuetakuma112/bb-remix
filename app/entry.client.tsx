// import * as Sentry from "@sentry/remix";
/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { Buffer } from 'buffer'

globalThis.Buffer = Buffer as unknown as BufferConstructor;

// Sentry.init({
//     dsn: "https://00acf855cec4422e8866e090a725df99@o4507221516484608.ingest.us.sentry.io/4507221518385152",
//     tracesSampleRate: 1,
//     replaysSessionSampleRate: 0.1,
//     replaysOnErrorSampleRate: 1,

//     integrations: [Sentry.browserTracingIntegration({
//       useEffect,
//       useLocation,
//       useMatches
//     // eslint-disable-next-line import/namespace
//     }), Sentry.replayIntegration()]
// })

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});