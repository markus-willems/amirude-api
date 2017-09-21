import { Router } from 'express'
import hash from 'string-hash'

export default pool => {
  let questions = Router()

  questions.get('/', function(req, res, next) {
    pool
      .query('SELECT * FROM questions')
      .then(data => res.json(data.rows))
      .catch(e =>
        setImmediate(() => {
          throw e
        })
      )
  })

  questions.get('/random', function(req, res, next) {
    pool
      .query('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1')
      .then(data =>
        res.json({
          ...data.rows[0],
          hash: hash(data.rows[0].question + data.rows[0].id)
        })
      )
      .catch(e =>
        setImmediate(() => {
          throw e
        })
      )
  })

  questions.get('/:hash', function(req, res, next) {
    if (req.params.hash) {
      const hash = req.params.hash
      pool
        .query('SELECT * FROM questions WHERE hash = $1', [hash])
        .then(data => {
          res.json(data.rows[0])
        })
        .catch(e => res.json(null))
    }
  })

  questions.post('/add', function(req, res, next) {
    if (req.body.question !== '') {
      const question = req.body.question
      const insertQuery =
        'INSERT INTO questions (question) VALUES ($1) RETURNING id'
      pool
        .query(insertQuery, [question])
        .then(data => {
          pool
            .query(
              'UPDATE questions SET hash = $1 WHERE id = $2 RETURNING hash',
              [hash(question + data.rows[0].id), data.rows[0].id]
            )
            .then(data => {
              res.json(data.rows[0].hash)
            })
            .catch(e =>
              setImmediate(() => {
                throw e
              })
            )
        })
        .catch(e =>
          setImmediate(() => {
            throw e
          })
        )
    } else {
      res.status(400).send('Questions is empty!')
    }
  })

  questions.post('/upvote', function(req, res, next) {
    if (req.body.question !== '') {
      const id = req.body.id
      const updateQuery =
        'UPDATE questions SET upvotes = upvotes + 1 WHERE id = $1'
      pool
        .query(updateQuery, [id])
        .then(data => res.json(data.rows))
        .catch(e =>
          setImmediate(() => {
            throw e
          })
        )
    } else {
      res.status(400).send('Unknown id!')
    }
  })

  questions.post('/downvote', function(req, res, next) {
    if (req.body.question !== '') {
      const id = req.body.id
      const updateQuery =
        'UPDATE questions SET downvotes = downvotes - 1 WHERE id = $1'
      pool
        .query(updateQuery, [id])
        .then(data => res.json(data.rows))
        .catch(e =>
          setImmediate(() => {
            throw e
          })
        )
    } else {
      res.status(400).send('Unknown id!')
    }
  })

  return questions
}
