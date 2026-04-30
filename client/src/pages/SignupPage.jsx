import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', form)
      login(res.data.data.user)
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed'
      toast.error(msg)
      setErrors({ server: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-1">Join Team Task Manager</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {errors.server && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {errors.server}
              </div>
            )}

            <div>
              <label htmlFor="signup-name" className="label">Full name</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Jane Smith"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="signup-email" className="label">Email address</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="signup-password" className="label">Password</label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="label">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {['MEMBER', 'ADMIN'].map(r => (
                  <button
                    key={r}
                    type="button"
                    id={`role-${r.toLowerCase()}`}
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${
                      form.role === r
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {r === 'ADMIN' ? '👑 Admin' : '👤 Member'}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
