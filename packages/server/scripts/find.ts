import { File, initDatabase } from '@/db'

async function main() {
  const orm = await initDatabase('../../_data/user.db')
  console.dir(await File.find(orm, ...process.argv.slice(2)), { depth: null })
}

main().catch(console.error)
