import fs from 'fs'
import path from 'path'

import sqlite3 from 'better-sqlite3'
import cheerio from 'cheerio'
import glob from 'fast-glob'
import matter from 'gray-matter'
import sanitize from 'sanitize-filename'
import showdown from 'showdown'

export default class Db {
  sql: sqlite3.Database
  mdConverter = new showdown.Converter({
    metadata: true,
  })

  $ = cheerio.load('')

  constructor(
    public dbname = '/home/patarapolw/projects/music-browser/packages/browser/generated/files.db',
    public root = '/home/patarapolw/projects/music-browser/_docs'
  ) {
    this.sql = sqlite3(dbname)
    this.init()
  }

  init() {
    this.sql.exec(/* sql */ `
    CREATE TABLE IF NOT EXISTS files (
      id            TEXT PRIMARY KEY, -- sanitized filepath at creation; unique
      originalPath  TEXT NOT NULL,    -- absolute path
      filePath      TEXT NOT NULL,    -- absolute path
      lastRead      FLOAT,            -- +new Date() number; nullable
      rating        INT,
      author        TEXT,
      title         TEXT NOT NULL     -- at least last part of the filename
    );

    CREATE INDEX IF NOT EXISTS files_lastRead ON files(lastRead);
    CREATE INDEX IF NOT EXISTS files_rating ON files(rating);
    `)

    this.sql.exec(/* sql */ `
    CREATE VIRTUAL TABLE IF NOT EXISTS q USING fts5(
      fileId,     -- REFERENCES files(id)
      author,     -- ', ' joined Set
      title,      -- ', ' joined Set
      tag,        -- ', ' joined Set
      content     -- cleaned markdown-to-plaintext
    )
    `)

    {
      const stmt = {
        files: {
          get: this.sql.prepare(/* sql */ `
          SELECT id fileId
          FROM files
          WHERE originalPath = @originalPath
          `),
          set: this.sql.prepare(/* sql */ `
          UPDATE files
          SET
            filePath = @filePath,
            author = @authorRepr,
            title = @titleRepr
          WHERE id = @fileId
          `),
          insert: this.sql.prepare(/* sql */ `
          INSERT INTO files (id, filePath, author, title)
          VALUES (@fileId, @filePath, @authorRepr, @titleRepr)
          `),
        },
        q: {
          set: this.sql.prepare(/* sql */ `
          UPDATE q
          SET
            author = @author,
            title = @title,
            tag = @tag,
            content = @content
          WHERE fileId = @fileId
          `),
          insert: this.sql.prepare(/* sql */ `
          INSERT INTO q (fileId, author, title, tag, content)
          VALUES (@fileId, @author, @title, @tag, @content)
          `),
        },
      }

      this.sql.transaction(() => {
        glob
          .sync('**/*.md', {
            cwd: this.root,
          })
          .map((f) => {
            const filePath = path.resolve(this.root, f)
            const { data: header, content: markdown } = matter(
              fs.readFileSync(filePath, 'utf-8')
            )
            const originalPath: string = header.originalPath || filePath

            const author: string[] = Array.isArray(header.author)
              ? header.author
              : typeof header.author === 'string'
              ? [header.author]
              : []
            const authorRepr: string | undefined = author[0]

            const title: string[] = Array.isArray(header.title)
              ? header.title
              : typeof header.title === 'string'
              ? [header.title]
              : []
            if (!title.length) {
              title.push(path.parse(f).name)
            }
            const titleRepr = title[0]

            const tag: string[] = Array.isArray(header.tag)
              ? header.tag
              : typeof header.tag === 'string'
              ? [header.tag]
              : []

            const fileId: string = (() => {
              const r = stmt.files.get.get({ originalPath })
              if (r) {
                stmt.files.set.run({
                  fileId: r.fileId,
                  filePath,
                  authorRepr,
                  titleRepr,
                })

                return r.fileId
              }

              const fileId = sanitize(f)

              stmt.files.insert.run({
                fileId,
                filePath,
                authorRepr,
                titleRepr,
              })

              return fileId
            })()

            const content = this.$('<div>')
              .html(this.mdConverter.makeHtml(markdown))
              .text()

            const r = stmt.q.set.run({
              author: author.join(', '),
              title: title.join(', '),
              tag: tag.join(', '),
              content,
              fileId,
            }).lastInsertRowid

            if (!r) {
              stmt.q.insert.run({
                author: author.join(', '),
                title: title.join(', '),
                tag: tag.join(', '),
                content,
                fileId,
              })
            }
          })
      })()
    }
  }

  getRecent(
    offset = 0
  ): {
    author: string
    title: string
  }[] {
    return this.sql
      .prepare(
        /* sql */ `
    SELECT
      author,
      title
    FROM files
    WHERE lastRead IS NOT NULL
    ORDER BY lastRead DESC
    LIMIT 10 OFFSET ${offset}
    `
      )
      .all()
  }

  getFavorite(
    offset = 0
  ): {
    author: string
    title: string
  }[] {
    return this.sql
      .prepare(
        /* sql */ `
    SELECT
      author,
      title
    FROM files
    WHERE rating IS NOT NULL
    ORDER BY rating DESC
    LIMIT 10 OFFSET ${offset}
    `
      )
      .all()
  }

  search(
    q: string,
    offset = 0
  ): {
    author: string
    title: string
  }[] {
    return this.sql
      .prepare(
        /* sql */ `
    SELECT
      f.author  author,
      f.title   title
    FROM q
    JOIN files f ON f.id = q.fileId
    WHERE q = @q
    ORDER BY RANK
    LIMIT 10 OFFSET ${offset}
    `
      )
      .all({ q })
  }

  get(fileId: string): string | null {
    const { filePath } =
      this.sql
        .prepare(
          /* sql */ `
    SELECT filePath
    FROM files
    WHERE id = @fileId
    `
        )
        .get({ fileId }) || {}

    if (fs.existsSync(filePath)) {
      this.sql
        .prepare(
          /* sql */ `
      UPDATE files
      SET lastRead = @lastRead
      WHERE id = @fileId
      `
        )
        .run({
          lastRead: +new Date(),
          fileId,
        })

      return this.mdConverter.makeHtml(fs.readFileSync(filePath, 'utf-8'))
    }

    return null
  }

  doRate(fileId: string, d: number): number {
    let { rating } =
      this.sql
        .prepare(
          /* sql */ `
    SELECT rating
    FROM files
    WHERE id = @fileId
    `
        )
        .get({ fileId }) || {}

    rating = (rating || 0) + d

    this.sql
      .prepare(
        /* sql */ `
    UPDATE files
    SET rating = @rating
    WHERE id = @fileId
    `
      )
      .run({
        rating,
        fileId,
      })

    return rating
  }
}
