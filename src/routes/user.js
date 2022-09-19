import { Router } from 'express'
import { create, index } from '../controllers/user.controller'

const userRouter = Router()

userRouter.post('/', create)
userRouter.get('/', index)

export default userRouter
