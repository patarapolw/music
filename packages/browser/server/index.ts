import bodyParser from 'body-parser'
import express from 'express'
import * as z from 'zod'

import Db from './db'

const app = express()
const db = new Db()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  const id = z.string().parse(req.query.id)
  res.send(db.get(id))
})

app.get('/all', (_, res) => {
  res.send({
    result: db.all(),
  })
})

app.get('/q', (req, res) => {
  const { q, offset = '0' } = z
    .object({
      q: z.string(),
      offset: z
        .string()
        .refine((s) => !isNaN(parseInt(s)))
        .optional(),
    })
    .parse(req.query)

  res.send({
    result: db.search(q, parseInt(offset)),
  })
})

app.get('/recent', (req, res) => {
  const { offset = '0' } = z
    .object({
      offset: z
        .string()
        .refine((s) => !isNaN(parseInt(s)))
        .optional(),
    })
    .parse(req.query)

  res.send({
    result: db.getRecent(parseInt(offset)),
  })
})

app.get('/favorite', (req, res) => {
  const { offset = '0' } = z
    .object({
      offset: z
        .string()
        .refine((s) => !isNaN(parseInt(s)))
        .optional(),
    })
    .parse(req.query)

  res.send({
    result: db.getFavorite(parseInt(offset)),
  })
})

app.patch('/rate', (req, res) => {
  const { id, d } = z
    .object({
      id: z.string(),
      d: z.string().refine((s) => !isNaN(parseInt(s))),
    })
    .parse(req.query)

  res.send({
    result: db.doRate(id, parseInt(d)),
  })
})

export default app
