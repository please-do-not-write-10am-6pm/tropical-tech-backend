import { Router } from 'express'

import { pay } from '../controllers/pay.controller'

const payRouter = Router()

payRouter.post('/createPayment', pay)
