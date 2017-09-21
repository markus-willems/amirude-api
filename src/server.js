import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
import logger from 'morgan'
import bodyParser from 'body-parser'
import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.POSTGRESQL_USER,
  host: process.env.POSTGRESQL_HOST,
  database: process.env.POSTGRESQL_DATABASE,
  password: process.env.POSTGRESQL_PASSWORD,
  port: process.env.POSTGRESQL_PORT
})

const dotenvConfig = dotenv.config()
const app = express()

// set middlware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Who can use our API?
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
)
if (process.env.NODE_ENV === 'dev') {
  app.use(logger('dev'))
}
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// import api routes
import routes from './api/'

// set api routes
app.use('/api', routes(pool))

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000
const ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(port, ip)

console.log('Server running on http://%s:%s', ip, port)

module.exports = app
