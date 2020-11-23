import { build, initDatabase } from '@/db'

async function main() {
  const orm = await initDatabase('../../_data/user.db')
  await build(orm, '../../_data/**/*.{pdf,md,ly}')
}

main().catch(console.error)
