import { File, initDatabase } from '@/db'

async function main() {
  const orm = await initDatabase('../../_data/user.db')

  console.log(
    await orm
      .createQueryBuilder()
      .select('json_group_array(path)', 'paths')
      .addSelect('person.name', 'author')
      .addSelect('title.name', 'title')
      .from(File, 'f')
      .leftJoin('f.author', 'person')
      .leftJoin('f.title', 'title')
      .having('COUNT(path) > 1')
      .groupBy('authorId')
      .addGroupBy('titleId')
      .getRawMany()
      .then((rs) =>
        rs.map((r) => ({
          ...r,
          paths: JSON.parse(r.paths)
        }))
      )
  )

  console.log(
    await orm
      .createQueryBuilder()
      .select('json_group_array(path)', 'paths')
      .addSelect('person.name', 'author')
      .addSelect('title.name', 'title')
      .from(File, 'f')
      .leftJoin('f.author', 'person')
      .leftJoin('f.title', 'title')
      .having('COUNT(path) > 1 AND [hash] IS NOT NULL')
      .groupBy('hash')
      .getRawMany()
      .then((rs) =>
        rs.map((r) => ({
          ...r,
          paths: JSON.parse(r.paths)
        }))
      )
  )
}

main().catch(console.error)
