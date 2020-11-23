import 'reflect-metadata'

import {
  BaseEntity,
  Column,
  Connection,
  Entity,
  In,
  Index,
  ManyToOne,
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
export class Person extends BaseEntity {
  @PrimaryGeneratedColumn() id!: number
  @Column({ unique: true, collation: 'NOCASE' }) name: string

  constructor(name: string) {
    super()
    this.name = name
  }
}

@Entity()
export class Title extends BaseEntity {
  @PrimaryGeneratedColumn() id!: number
  @Column({ unique: true, collation: 'NOCASE' }) name: string

  constructor(name: string) {
    super()
    this.name = name
  }
}

@Entity()
export class File extends BaseEntity {
  @PrimaryColumn() id!: string
  @UpdateDateColumn() updatedAt?: Date

  @Column({ unique: true }) path!: string
  @Column({ nullable: true }) @Index() size?: number
  @Column({ nullable: true }) @Index() hash?: string

  @ManyToOne(() => Person, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true
  })
  author?: Person

  @ManyToOne(() => Title, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  title!: Title

  @Column({ nullable: true }) description?: string
  @Column({ type: 'simple-json', nullable: true }) matter?: any

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
        .replace(/\[[^\]]+\]/, '')
        .replace(/\.[^\.]+$/, '')
        .replace(/\([^)]+\)$/, '')
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
        author = _author || author

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
        const names = ents.map((et) => et.author!).filter((el) => el)

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
