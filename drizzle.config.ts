import type { Config } from "drizzle-kit";
import path from "path";

const wranglerConfigPath = path.resolve(__dirname, "wrangler.toml");

export default process.env.LOCAL_DB_PATH
  ? ({
      schema: "./app/db/schema.ts",
      driver: "better-sqlite",
      dbCredentials: {
        url: process.env.LOCAL_DB_PATH!,
      },
      dialect: "sqlite"
    })
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
      dialect: "sqlite"
    } satisfies Config);
