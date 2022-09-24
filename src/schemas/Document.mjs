import mongoose from 'mongoose'
import User from './User.mjs'

const DocumentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Enter your URL']
  },

  typeOfId: {
    type: String
  },

  countryOfIssue: {
    type: String
  },

  issueDate: {
    type: Date
  },

  expireDate: {
    type: Date
  },

  number: {
    type: String
  },

  userId: {
    type: mongoose.ObjectId,
    ref: User
  }
})

export default mongoose.model('Document', DocumentSchema)
