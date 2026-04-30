import logger from '../utils/logger.js'

// 404 — no route matched
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
  })
}

// Global error handler — last middleware in chain
export function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message)

  // Prisma known request errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      data: null,
      message: 'Duplicate entry',
      error: 'A record with this value already exists.',
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Record not found',
      error: 'The requested record does not exist.',
    })
  }

  const status = err.statusCode || err.status || 500
  const message = err.message || 'Internal server error'

  return res.status(status).json({
    success: false,
    data: null,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    error: process.env.NODE_ENV === 'production' ? null : (err.stack || message),
  })
}
