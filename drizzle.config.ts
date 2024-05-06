import type { Config } from "drizzle-kit";

export default {
  schema: "./app/lib/schema.ts",
  out: "./migrations",
  driver: "d1",
} satisfies Config;
