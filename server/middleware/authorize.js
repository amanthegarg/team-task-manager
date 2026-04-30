/**
 * Role-based access guard middleware factory.
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'MEMBER')
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required',
        error: 'You must be logged in to access this resource.',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Access denied',
        error: `This action requires one of the following roles: ${roles.join(', ')}.`,
      })
    }

    next()
  }
}
