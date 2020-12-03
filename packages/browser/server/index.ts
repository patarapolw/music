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

app.delete('/', (req, res) => {
  const id = z.string().parse(req.query.id)
  db.doDelete(id)

  res.status(201).send({
    result: 'successfully deleted',
  })
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

app.get('/rate', (req, res) => {
  const { id } = z
    .object({
      id: z.string(),
    })
    .parse(req.query)

  res.send({
    result: db.getRating(id),
  })
})

app.patch('/rate', (req, res) => {
  const { id, rating } = z
    .object({
      id: z.string(),
      rating: z.string().refine((s) => !isNaN(parseInt(s))),
    })
    .parse(req.query)

  const newRating = db.doRate(id, parseInt(rating))

  res.status(201).send({
    result: {
      rating: newRating,
    },
  })
})

export default app
