import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import parser from 'body-parser'
const { urlencoded, json } = parser
import logger from 'morgan'
import { createHash } from 'crypto'
import { config as _config } from 'dotenv'

import authRouter from './routes/auth.mjs'
import userRouter from './routes/user.mjs'
import sessionRouter from './routes/session.mjs'
import hotelRouter from './routes/hotel.mjs'
import payRouter from './routes/pay.mjs'

import dotenv from 'dotenv'
dotenv.config()
_config()

const app = express()
const saltRounds = 10
let utcDate = Math.floor(new Date().getTime() / 1000)
const publicKey = process.env.hotelApi_PUBLICKEY
let privateKey = process.env.hotelApi_PRIVATEKEY
let assemble = publicKey + privateKey + utcDate
let hash = createHash('sha256').update(assemble).digest('hex')

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Accept', 'application/json')
  res.header('Access-Control-Allow-Header', 'x-requested-with, Content-Type, Api-Key')
  res.header('Api-key', publicKey)
  res.header('secret', privateKey)
  res.header('X-Signature', hash)
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
  }

  next()
})

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(cors())
app.use(logger('dev'))

app.use((error, req, res, next) => {
  res.status(error.status || 500).send({
    status: 'Error',
    message: error.message || 'Internal Server Error'
  })
})

// app.use('/api', auth)
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/session', sessionRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/pay', payRouter)

const server = async () => {
  try {
    await mongoose.connect('mongodb://root:root@localhost:27017/tropical_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    app.listen(7676, () => console.log('Server started on port 7676'))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

server()
