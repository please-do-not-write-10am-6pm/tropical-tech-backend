import { Router } from 'express'

import { pay } from '../controllers/pay.controller.mjs'

const payRouter = Router()

payRouter.post('/createPayment', pay)

export default payRouter
