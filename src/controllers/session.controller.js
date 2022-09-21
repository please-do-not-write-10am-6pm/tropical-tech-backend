import { sign } from 'jsonwebtoken'
import User from '../schemas/User'
import Hotel from '../schemas/Hotel'
import Booking from '../schemas/Booking'
import { compare } from 'bcryptjs'

export const create = async (request, response) => {
  const { username, password } = request.body

  // Check if the user exists in the system.
  const user = await User.findOne({
    username
  })

  if (!user) {
    return response.status(404).json({ error: 'User not found!' })
  }

  //Check that the password is correct
  const matchPassword = await compare(password, user.password)

  if (!matchPassword) {
    return response.status(404).json({ error: 'Incorrect password or username!' })
  }

  const token = sign({}, '4ccdcbc7ec60819cfb8bca1c20862b69', {
    subject: new String(user._id),
    expiresIn: '1d'
  })

  return response.json({
    token,
    user
  })
}
