import {
  Cascade,
  Entity,
  JsonType,
  ManyToOne,
  MikroORM,
  PrimaryKey,
  Property
} from '@mikro-orm/core'

import { SqliteDriver } from '@mikro-orm/sqlite'
import { Ulid } from 'id128'
import crypto from 'crypto'
import fs from 'fs'
import glob from 'fast-glob'
import matterFn from 'gray-matter'
import path from 'path'
import yaml from 'js-yaml'

@Entity()
export class Person {
  @PrimaryKey() id!: number
  @Property({ unique: true }) name: string

  constructor(name: string) {
    this.name = name
  }
}

@Entity()
export class Title {
  @PrimaryKey() id!: number
  @Property({ unique: true }) name: string

  constructor(name: string) {
    this.name = name
  }
}

@Entity()
export class File {
  @PrimaryKey() id = Ulid.generate().toCanonical()
  @Property({ onUpdate: () => new Date(), nullable: true }) updatedAt?: Date

  @Property({ unique: true }) path!: string
  @Property({ index: true, nullable: true }) size?: number
  @Property({ index: true, nullable: true }) hash?: string

  @ManyToOne({ cascade: [Cascade.ALL], nullable: true }) author?: Person
  @ManyToOne({ cascade: [Cascade.ALL] }) title!: Title

  @Property({ nullable: true }) description?: string
  @Property({ type: JsonType, nullable: true }) matter?: any

  static async findOrCreate(
    orm: MikroORM<SqliteDriver>,
    entries: {
      filename: string
    }[]
  ) {
    const ents = entries.map(({ filename }) => {
      const { base: lastSegment, ext: _ext } = path.parse(filename)
      const extension = _ext.toLocaleLowerCase()

      let title = lastSegment
        .replace(/\[[^\]]+\]/, '')
        .replace(/\.[^\.]+$/, '')
        .trim()

      let author = (() => {
        const m = /\[([^\]]+)\]/.exec(lastSegment)
        if (m) {
          return m[1] || null
        }

        return null
      })()

      let description =
        (() => {
          const m = /\(([^\)]+)\)/.exec(lastSegment)
          if (m) {
            return m[1] || null
          }

          return null
        })() || ''

      let id = ''
      let matter: any = undefined

      if (['.md', '.markdown'].includes(extension)) {
        const {
          data: { _id, _title, _desc, ...data }
        } = matterFn(fs.readFileSync(filename, 'utf-8'), {
          engines: {
            yaml: (s: string) =>
              (yaml.safeLoad(s, {
                schema: yaml.JSON_SCHEMA
              }) as Record<string, unknown>) || {}
          }
        })

        id = _id || id
        title = _title || title

        if (_desc) {
          description = description ? description + '\n' + _desc : _desc
        }

        if (data && Object.keys(data).length) {
          matter = data
        }
      } else if (extension === '.ly') {
        fs.readFileSync(filename, 'utf-8')
          .split(/\n/g)
          .reverse()
          .map((r) => {
            if (r.startsWith('% id:')) {
              id = r.split(':')[1].trim() || id
            } else if (r.startsWith('% title:')) {
              title = r.split(':')[1].trim() || title
            }
          })
      }

      return {
        path: path.resolve(filename),
        extension,
        author,
        title,
        description,
        matter,
        id
      }
    })

    const [elTitles, elAuthors, elFiles] = await Promise.all([
      orm.em
        .find(Title, {
          $or: ents.map((et) => ({
            name: {
              $like: et.title.replace(/[%_[]/g, '[$&]')
            }
          }))
        })
        .then((rs) => {
          const map = new Map<string, Title>()
          rs.map((r) => map.set(r.name.toLocaleLowerCase(), r))
          return map
        }),
      (async (): Promise<Map<string, Person>> => {
        const names = ents
          .map((et) => et.author!)
          .filter((el) => el)
          .map((el) => el.toLocaleLowerCase())

        if (!names.length) {
          return new Map()
        }

        return orm.em
          .find(Person, {
            $or: names.map((et) => ({
              name: {
                $like: et.replace(/[%_[]/g, '[$&]')
              }
            }))
          })
          .then((rs) => {
            const map = new Map<string, Person>()
            rs.map((r) => map.set(r.name.toLocaleLowerCase(), r))
            return map
          })
      })(),
      orm.em
        .find(File, {
          path: {
            $in: ents.map((et) => et.path)
          }
        })
        .then((rs) => {
          const map = new Map<string, File>()
          rs.map((r) => map.set(r.path, r))
          return map
        })
    ])

    const newTitles: Title[] = []
    const newAuthors: Person[] = []

    const allEnts = ents.map((et) => {
      const existing = elFiles.get(et.path)
      const el = existing || new File()

      let h = ''

      if (et.extension === '.pdf') {
        const stats = fs.statSync(et.path)
        el.size = stats.size
        h = crypto
          .createHash('sha256')
          .update(fs.readFileSync(et.path))
          .digest()
          .toString('base64')
        el.hash = h
      }

      if (!existing) {
        el.id = et.id || h || el.id
      }

      el.title =
        elTitles.get(et.title.toLocaleLowerCase()) ||
        (() => {
          const t = new Title(et.title)
          newTitles.push(t)
          elTitles.set(et.title.toLocaleLowerCase(), t)
          return t
        })()

      if (et.author) {
        el.author =
          elAuthors.get(et.author.toLocaleLowerCase()) ||
          (() => {
            const t = new Person(et.author)
            newAuthors.push(t)
            elAuthors.set(et.author.toLocaleLowerCase(), t)
            return t
          })()
      }

      el.path = et.path

      return el
    })

    await orm.em.persistAndFlush([...newTitles, ...newAuthors, ...allEnts])

    return allEnts
  }

  private constructor() {}
}

export async function initDatabase(filename: string) {
  const isExists = fs.existsSync(filename)

  const orm = await MikroORM.init<SqliteDriver>({
    entities: [Person, Title, File],
    type: 'sqlite',
    dbName: filename
  })

  if (!isExists) {
    const migrator = orm.getMigrator()
    await migrator.createMigration()
    await migrator.up()
  }

  return orm
}

async function main() {
  const orm = await initDatabase('../../_data/user.db')

  await glob('../../_data/**/*.{pdf,md,ly}').then((rs) =>
    File.findOrCreate(
      orm,
      rs.map((filename) => ({ filename }))
    )
  )

  await orm.close()
}

if (require.main === module) {
  main().catch(console.error)
}
