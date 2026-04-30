import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Spinner from '../components/Spinner'

export default function CreateTaskPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultProjectId = searchParams.get('projectId') || ''

  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', status: 'TODO', priority: 'MEDIUM',
    dueDate: '', projectId: defaultProjectId, assignedTo: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.data.projects))
      .catch(() => toast.error('Failed to load projects'))
  }, [])

  useEffect(() => {
    if (!form.projectId) { setMembers([]); return }
    setLoadingMembers(true)
    api.get(`/projects/${form.projectId}`)
      .then(res => setMembers(res.data.data.project.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false))
  }, [form.projectId])

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    else if (form.title.length > 100) errs.title = 'Title must be 100 characters or less'
    if (!form.projectId) errs.projectId = 'Please select a project'
    if (form.dueDate && new Date(form.dueDate) <= new Date()) errs.dueDate = 'Due date must be in the future'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || undefined,
      }
      await api.post('/tasks', payload)
      toast.success('Task created!')
      navigate('/tasks')
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create task'
      toast.error(msg)
      setErrors({ server: msg })
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/tasks" className="hover:text-indigo-400 transition-colors">Tasks</Link>
          <span>/</span>
          <span className="text-gray-200">New Task</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Create Task</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {errors.server && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{errors.server}</div>
          )}

          <div>
            <label htmlFor="task-title" className="label">Title <span className="text-red-400">*</span></label>
            <input id="task-title" className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g. Design new landing page" maxLength={100}
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="task-desc" className="label">Description <span className="text-gray-500">(optional)</span></label>
            <textarea id="task-desc" className="input-field resize-none" rows={3}
              placeholder="Detailed description of the task..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-status" className="label">Status</label>
              <select id="task-status" className="input-field" value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-priority" className="label">Priority</label>
              <select id="task-priority" className="input-field" value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="task-project" className="label">Project <span className="text-red-400">*</span></label>
            <select id="task-project" className={`input-field ${errors.projectId ? 'border-red-500' : ''}`}
              value={form.projectId}
              onChange={e => setForm(f => ({ ...f, projectId: e.target.value, assignedTo: '' }))}>
              <option value="">Select a project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.projectId && <p className="text-red-400 text-xs mt-1">{errors.projectId}</p>}
          </div>

          <div>
            <label htmlFor="task-assignee" className="label">Assign To <span className="text-gray-500">(optional)</span></label>
            <select id="task-assignee" className="input-field" value={form.assignedTo}
              onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
              disabled={!form.projectId || loadingMembers}>
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId}>{m.user.name} ({m.user.email})</option>
              ))}
            </select>
            {loadingMembers && <p className="text-xs text-gray-400 mt-1">Loading members...</p>}
          </div>

          <div>
            <label htmlFor="task-due" className="label">Due Date <span className="text-gray-500">(optional)</span></label>
            <input id="task-due" type="date" className={`input-field ${errors.dueDate ? 'border-red-500' : ''}`}
              value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            {errors.dueDate && <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Link to="/tasks" className="btn-secondary flex-1 text-center">Cancel</Link>
            <button type="submit" id="create-task-submit" disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Spinner size="sm" />Creating...</> : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
