import User from '../schemas/User.mjs'
import bcrypt from 'bcryptjs'
const { hash } = bcrypt

export const create = async (request, response) => {
  const { username, adress, email, mobilenumber, password } = request.body

  const passwordCrypt = await hash(password, 8)

  const user = await User.create({
    username,
    adress,
    email,
    mobilenumber,
    password: passwordCrypt
  })

  return response.json(user)
}

export const index = async (request, response) => {
  const users = await User.find()
  return response.json(users)
}
