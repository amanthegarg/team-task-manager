import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import RoleGuard from '../components/RoleGuard'

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Project name is required'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/projects', form)
      toast.success('Project created!')
      onCreated(res.data.data.project)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-5">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label htmlFor="proj-name" className="label">Project Name</label>
            <input id="proj-name" className="input-field" placeholder="e.g. Website Redesign" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="proj-desc" className="label">Description <span className="text-gray-500">(optional)</span></label>
            <textarea id="proj-desc" className="input-field resize-none" rows={3} placeholder="Brief project description..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Spinner size="sm" />Creating...</> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data.data.projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <RoleGuard allowedRoles={['ADMIN']}>
          <button id="create-project-btn" onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </RoleGuard>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📁</div>
          <p className="text-gray-400 text-lg">No projects yet</p>
          {user?.role === 'ADMIN' && (
            <p className="text-gray-500 text-sm mt-2">Create your first project to get started</p>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`}
              className="card hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:shadow-2xl transition-all duration-300 group block">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center group-hover:bg-indigo-600/30 transition-colors">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{project.name}</h3>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description || 'No description'}</p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  👥 {project._count?.members ?? 0} members
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  ✅ {project._count?.tasks ?? 0} tasks
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={p => setProjects(ps => [p, ...ps])}
        />
      )}
    </div>
  )
}
