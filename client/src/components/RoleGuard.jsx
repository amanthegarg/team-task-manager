import { useAuth } from '../context/AuthContext'

/**
 * RoleGuard — renders children only if the current user's role is in allowedRoles.
 * Can also be used as a render-gating wrapper (returns null silently for unauthorized).
 *
 * Props:
 *   allowedRoles: string[]   — e.g. ['ADMIN']
 *   fallback?: ReactNode     — optional fallback UI (default: null)
 */
export default function RoleGuard({ allowedRoles, fallback = null, children }) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback
  }

  return children
}
