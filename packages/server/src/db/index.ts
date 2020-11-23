import 'reflect-metadata'

import {
  Column,
  Connection,
  Entity,
  In,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  createConnection
} from 'typeorm'

import { Ulid } from 'id128'
import crypto from 'crypto'
import fs from 'fs'
import glob from 'fast-glob'
import matterFn from 'gray-matter'
import path from 'path'
import yaml from 'js-yaml'

@Entity()
export class Person {
  @PrimaryGeneratedColumn() id!: number
  @Column({ unique: true, collation: 'NOCASE' }) name: string

  @ManyToOne(() => Person, (p) => p.parent) aliases!: Person[]
  @OneToMany(() => Person, (p) => p.aliases) parent?: Person

  constructor(name: string) {
    this.name = name
  }
}

@Entity()
export class Title {
  @PrimaryGeneratedColumn() id!: number
  @Column({ unique: true, collation: 'NOCASE' }) name: string

  @ManyToOne(() => Title, (p) => p.parent) aliases!: Title[]
  @OneToMany(() => Title, (p) => p.aliases) parent?: Title

  constructor(name: string) {
    this.name = name
  }
}

@Entity()
export class File {
  @PrimaryColumn() id!: string
  @UpdateDateColumn() updatedAt?: Date

  @Column({ unique: true }) path!: string
  @Column({ nullable: true }) @Index() size?: number
  @Column({ nullable: true }) @Index() hash?: string

  @ManyToMany(() => Person, { cascade: true })
  @JoinTable({ name: 'file_authors' })
  authors!: Person[]

  @ManyToOne(() => Title, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  title!: Title

  @Column({ nullable: true }) description?: string
  @Column({ type: 'simple-json', nullable: true }) matter?: any

  static async findDuplicates(orm: Connection) {
    return this.rawQuery(orm, { having: 'COUNT(path) > 1' })
  }

  static async find(orm: Connection, ...conds: string[]) {
    const params: any[] = []
    const where = conds
      .map((c) => {
        const [k, v] = c.split(/:/)
        params.push(v)
        return `${k} LIKE '%'||?||'%'`
      })
      .join(' AND ')

    return this.rawQuery(orm, { where, params })
  }

  private static async rawQuery(
    orm: Connection,
    {
      where,
      having,
      params
    }: {
      where?: string
      having?: string
      params?: any[]
    } = {}
  ) {
    return orm
      .query(
        /*sql*/ `
    SELECT
      f.id    fileId,
      t.name  title,
      p.name  author,
      "description"
    FROM      "file"          f
    LEFT JOIN file_authors    fa ON fa.fileId = f.id
    LEFT JOIN person          p  ON fa.personId = p.id
    LEFT JOIN title           t  ON f.titleId = t.id
    ${where ? `WHERE ${where}` : ''}
    ${having ? `HAVING ${having}` : ''}
    `,
        params
      )
      .then((rs: any[]) =>
        orm.getRepository(File).findByIds(
          rs.map((r) => r.fileId),
          {
            relations: ['authors', 'title']
          }
        )
      )
      .then((rs) => {
        const m = new Map<string, File[]>()
        rs.map((r) => {
          const author = r.authors[0]?.name || ''
          const k = author + '\x1f' + r.title.name
          const arr = m.get(k) || []
          arr.push(r)
          m.set(k, arr)
        })

        return Array.from(m).map(([_, files]) => ({
          authors: files
            .flatMap((f) => f.authors.map((a) => a.name))
            .filter((a, i, arr) => arr.indexOf(a) === i),
          title: files[0].title.name,
          paths: files.map((f) => f.path)
        }))
      })
  }

  static async findOrCreate(
    orm: Connection,
    entries: {
      filename: string
    }[]
  ) {
    const ents = entries.map(({ filename }) => {
      const { base: lastSegment, ext: _ext } = path.parse(filename)
      const extension = _ext.toLocaleLowerCase()

      let title = lastSegment
        .replace(/\[[^\]]+\]/g, '')
        .replace(/\.[^\.]+$/, '')
        .replace(/\([^)]+\)$/, '')
        .trim()

      const authors = (() => {
        const out: string[] = []
        const re = /\[([^\]]+)\]/g
        let m: RegExpExecArray | null

        while ((m = re.exec(lastSegment))) {
          out.push(m[1])
        }

        return out
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
          data: {
            id: _id,
            title: _title,
            author: _author,
            description: _desc,
            ...data
          }
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

        if (typeof _author === 'string') {
          authors.unshift(_author)
        } else if (Array.isArray(_author)) {
          authors.unshift(..._author)
        }

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
        authors: authors.filter(
          (a, i, arr) =>
            arr
              .map((x) => x.toLocaleLowerCase())
              .indexOf(a.toLocaleLowerCase()) === i
        ),
        title,
        description,
        matter,
        id
      }
    })

    const [elTitles, elAuthors, elFiles] = await Promise.all([
      orm
        .getRepository(Title)
        .find({
          name: In(ents.map((el) => el.title))
        })
        .then((rs) => {
          const map = new Map<string, Title>()
          rs.map((r) => map.set(r.name.toLocaleLowerCase(), r))
          return map
        }),
      (async (): Promise<Map<string, Person>> => {
        const names = ents.map((et) => et.authors).flat()

        if (!names.length) {
          return new Map()
        }

        return orm
          .getRepository(Person)
          .find({
            name: In(names)
          })
          .then((rs) => {
            const map = new Map<string, Person>()
            rs.map((r) => map.set(r.name.toLocaleLowerCase(), r))
            return map
          })
      })(),
      orm
        .getRepository(File)
        .find({
          path: In(ents.map((et) => et.path))
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
        el.id = et.id || h || Ulid.generate().toCanonical()
      }

      el.title =
        elTitles.get(et.title.toLocaleLowerCase()) ||
        (() => {
          const t = new Title(et.title)
          newTitles.push(t)
          elTitles.set(et.title.toLocaleLowerCase(), t)
          return t
        })()

      el.authors = et.authors.map((a) => {
        const a0 = elAuthors.get(a.toLocaleLowerCase())
        if (a0) {
          return a0
        }

        const t = new Person(a)
        newAuthors.push(t)
        elAuthors.set(a.toLocaleLowerCase(), t)
        return t
      })

      el.path = et.path

      return el
    })

    if (newTitles.length) {
      const repo = orm.getRepository(Title)
      await Promise.all(newTitles.map((r) => repo.save(r)))
    }

    if (newAuthors.length) {
      const repo = orm.getRepository(Person)
      await Promise.all(newAuthors.map((r) => repo.save(r)))
    }

    const repo = orm.getRepository(File)
    await Promise.all(allEnts.map((r) => repo.save(r)))

    return allEnts
  }
}

export async function initDatabase(filename: string) {
  return createConnection({
    type: 'better-sqlite3',
    entities: [Person, Title, File],
    database: filename,
    synchronize: true
  })
}

export async function build(
  orm: Connection,
  paths: string | string[]
): Promise<Connection> {
  await glob(paths).then((rs) =>
    File.findOrCreate(
      orm,
      rs.map((filename) => ({ filename }))
    )
  )

  return orm
}
