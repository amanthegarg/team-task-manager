import jwt from 'jsonwebtoken'

export function authenticate(req, res, next) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Authentication required',
      error: 'No token provided. Please log in.',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Authentication failed',
      error: 'Token is invalid or expired. Please log in again.',
    })
  }
}
