import mongoose from 'mongoose'
import User from './User.mjs'

const AnswerSchema = new mongoose.Schema({
  question1: {
    type: String
  },

  answer1: {
    type: String
  },

  question2: {
    type: String
  },

  answer2: {
    type: String
  },

  userId: {
    type: mongoose.ObjectId,
    ref: User
  }
})

export default mongoose.model('Answer', AnswerSchema)
