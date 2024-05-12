import path from 'node:path'
import { unstable_dev } from 'wrangler'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const workerPath = path.resolve(__dirname, './seed.ts')
  const worker = await unstable_dev(workerPath, {
    local: true,
    nodeCompat: true,
    config: path.resolve(__dirname, '../../wrangler.toml'),
  })

  const response = await worker.fetch('/', {
    method: 'GET',
  })
  console.log(await response.text())
  await worker.stop()
}

main().catch((e) => {
  console.error(e)
  // eslint-disable-next-line no-undef
  process.exit(1)
})