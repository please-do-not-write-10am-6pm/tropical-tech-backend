import { verify } from 'jsonwebtoken'

export default async (request, response, next) => {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    return response.status(401).json({ error: 'User not authorizated!' })
  }

  const [, token] = authHeader.split(' ')

  try {
    verify(token, '4ccdcbc7ec60819cfb8bca1c20862b69')

    return next()
  } catch (err) {
    return response.status(401).json({ error: 'Invalid JWT Token' })
  }
}
