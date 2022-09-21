import mongoose from 'mongoose'
import User from './User'

const HotelSchema = new mongoose.Schema({
  hotelId: {
    type: String,
    trim: true,
    lowercase: true
  },

  userId: {
    type: mongoose.ObjectId,
    ref: User
  },

  ratings: {
    type: Number,
    default: 0
  },

  comment: {
    type: String
  },

  created: {
    type: String
  }
})

export default mongoose.model('Hotel', HotelSchema)
