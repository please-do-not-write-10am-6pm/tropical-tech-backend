import { Router } from 'express'

import { create } from '../controllers/session.controller'

const sessionRouter = Router()

sessionRouter.post('/session', create)

export default sessionRouter
