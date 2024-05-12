import path from "node:path";
import { unstable_dev } from "wrangler";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const workerPath = path.resolve(__dirname, "./seed.ts");
  const worker = await unstable_dev(workerPath, {
    local: true,
    nodeCompat: true,
    config: path.resolve(__dirname, "../wrangler.toml"),
  });

  // eslint-disable-next-line no-undef
  const seedImages = process.env.SEED_IMAGES.split(",");

  const response = await worker.fetch("/", {
    method: "POST",
    body: JSON.stringify(seedImages),
  });
  console.log(await response.text());
  await worker.stop();
}

main().catch((e) => {
  console.error(e);
  // eslint-disable-next-line no-undef
  process.exit(1);
});
