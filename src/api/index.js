import { Router } from 'express'

import questions from './routes/questions'

export default pool => {
  let api = Router()
  api.use('/questions', questions(pool)) // /api/questions
  return api
}
