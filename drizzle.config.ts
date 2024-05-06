import type { Config } from "drizzle-kit";
import path from "path";

const wranglerConfigPath = path.resolve(__dirname, "wrangler.toml");

export default process.env.LOCAL_DB_PATH
  ? ({
      schema: "./app/db/schema.ts",
      driver: "better-sqlite",
      dbCredentials: {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        url: process.env.LOCAL_DB_PATH!,
      },
    } satisfies Config)
  : ({
      schema: "./app/db/schema.ts",
      out: "./migrations",
      driver: "d1",
      dbCredentials: {
        wranglerConfigPath,
        dbName: "dev-d1",
      },
      verbose: true,
      strict: true,
    } satisfies Config);

// export default {
//   schema: "./app/db/schema.ts",
//   out: "./migrations",
//   driver: "d1",
// } satisfies Config;
