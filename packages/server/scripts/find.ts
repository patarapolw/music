import { File, initDatabase } from '@/db'

async function main(title: string) {
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
      .having(`title.name LIKE '%'||:title||'%'`, {
        title
      })
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
}

main(process.argv[2] || 'let it be').catch(console.error)
