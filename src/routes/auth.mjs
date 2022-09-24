import { Router } from 'express'
import multer from 'multer'

const upload = multer({ dest: './assets/img/t mp/' })

import {
  login,
  signup,
  uploadProfile,
  uploadDocuement,
  step1,
  step2,
  step3,
  step4,
  step4UploadId,
  generateCode,
  verifyCode,
  forgotPassword
} from '../controllers/auth.controller.mjs'

const authRouter = Router()

authRouter.post('/login', login)
authRouter.post('/signup', signup)
authRouter.post('/signup/upload-avatar', upload.single('profile'), uploadProfile)
authRouter.post('/signup/step1', step1)
authRouter.post('/signup/upload-document', upload.single('document'), uploadDocuement)
authRouter.post('/signup/step2', step2)
authRouter.post('/signup/step3', step3)
authRouter.post('/signup/step4', step4)
authRouter.post('/signup/step4/upload-id', upload.single('id'), step4UploadId)
authRouter.post('/signup/generateCode', generateCode)
authRouter.post('/signup/verifyCode', verifyCode)
authRouter.post('/forgotpassword', forgotPassword)

export default authRouter
