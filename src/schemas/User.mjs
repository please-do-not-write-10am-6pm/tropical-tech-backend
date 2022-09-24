import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  avatar_url: { type: String },

  firstName: {
    type: String,
    required: [true, 'Enter your firstname'],
    trim: true,
    lowercase: true
  },

  lastName: {
    type: String,
    required: [true, 'Enter your lastName'],
    trim: true,
    lowercase: true
  },

  birthDay: {
    type: Date,
    required: [true, 'Enter your birthday']
  },

  username: {
    type: String,
    required: [true, 'Enter your username'],
    unique: [true, 'Opps! Username has already taken'],
    trim: true
  },

  address1: {
    type: String,
    required: [true, 'Enter your address1'],
    trim: true
  },

  address2: {
    type: String,
    required: [true, 'Enter  your address2'],
    trim: true
  },

  state: {
    type: String,
    required: [true, 'Enter your state']
  },

  city: {
    type: String,
    required: [true, 'Enter your city']
  },

  postal: {
    type: String,
    required: [true, 'Enter your postalCode']
  },

  documentUrl: {
    type: String,
    required: [true, 'Enter your documentURL']
  },

  code: {
    type: Number,
    require: [true, 'Enter your code']
  },

  actived: {
    type: Boolean,
    default: false
  },

  email: {
    type: String,
    required: [true, 'Enter your email'],
    unique: [true, 'Email already exist'],
    validate: function (value) {
      let emailRegex =
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
      return emailRegex.test(value)
    }
  },

  phone: {
    type: String,
    require: [true, 'Enter your mobilenumber'],
    unique: [true, 'Mobile Number already exist'],
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: [
      true,
      'Password must contain at least 8 characters plus 1 alphabet, 1 special character and 1 number'
    ],
    minlength: 8,
    lowercase: true,
    uppercase: true,
    validate: function (value) {
      let passwordReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
      return passwordReg.test(value)
    }
  },

  type: {
    type: String
  },

  token: {
    type: String
  }
})

export default mongoose.model('Users', UserSchema)
