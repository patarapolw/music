import glob from 'fast-glob'
import sqlite3 from 'better-sqlite3'
// import yaml from 'js-yaml'

export class DbMusic {
  db: sqlite3.Database

  constructor(public filename: string) {
    this.db = sqlite3(filename)

    this.db.exec(/* sql */ `
    CREATE TABLE IF NOT EXISTS [entry] (
      [uid]     TEXT PRIMARY KEY,
      createdAt DATETIME NOT NULL DEFAULT strftime('%s', 'now'),
      updatedAt DATETIME,
      [path]    TEXT,
      size      FLOAT,
      [hash]    TEXT
    );

    CREATE INDEX IF NOT EXISTS entry_createdAt ON [entry](createdAt);
    CREATE INDEX IF NOT EXISTS entry_updatedAt ON [entry](updatedAt);
    CREATE INDEX IF NOT EXISTS entry_path ON [entry]([path]);
    CREATE INDEX IF NOT EXISTS entry_size ON [entry](size);
    CREATE UNIQUE INDEX IF NOT EXISTS entry_hash ON [entry]([hash]);
    `)

    this.db.exec(/* sql */ `
    CREATE VIRTUAL TABLE IF NOT EXISTS q USING fts5(
      entry_uid UNINDEXED, -- references [entry]([uid])
      author,
      title,
      matter, -- json
      [text]
    );
    `)
  }
}

async function main() {
  // const db = new DbMusic('../../_data/sheets.db')

  for await (const r of glob.stream('../../_data/**/*.{pdf,md,ly}')) {
    console.log(r)
  }
}

if (require.main === module) {
  main().catch(console.error)
}
