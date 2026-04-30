import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import RoleGuard from '../components/RoleGuard'

function StatusBadge({ status }) {
  const map = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' }
  const labels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }
  return <span className={map[status]}>{labels[status]}</span>
}

function PriorityBadge({ priority }) {
  const map = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' }
  return <span className={map[priority]}>{priority}</span>
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [form, setForm] = useState({})

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    api.get(`/tasks/${id}`)
      .then(res => {
        const t = res.data.data.task
        setTask(t)
        setForm({
          title: t.title, description: t.description || '', status: t.status,
          priority: t.priority, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
          projectId: t.projectId, assignedTo: t.assignedTo || '',
        })
      })
      .catch(() => { toast.error('Task not found'); navigate('/tasks') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    if (!isAdmin) return
    api.get('/projects').then(res => setProjects(res.data.data.projects))
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || !form.projectId) return
    api.get(`/projects/${form.projectId}`)
      .then(res => setMembers(res.data.data.project.members || []))
      .catch(() => setMembers([]))
  }, [form.projectId, isAdmin])

  async function handleSave() {
    setSaving(true)
    try {
      const payload = isAdmin
        ? { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null }
        : { status: form.status }
      const res = await api.put(`/tasks/${id}`, payload)
      setTask(res.data.data.task)
      toast.success('Task updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this task?')) return
    setDeleting(true)
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      navigate('/tasks')
    } catch { toast.error('Delete failed'); setDeleting(false) }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!task) return null

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/tasks" className="hover:text-indigo-400 transition-colors">Tasks</Link>
          <span>/</span>
          <span className="text-gray-200 truncate">{task.title}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!editing ? (
              <>
                <button id="edit-task-btn" onClick={() => setEditing(true)} className="btn-secondary text-sm py-2 px-4">Edit</button>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <button id="delete-task-btn" onClick={handleDelete} disabled={deleting}
                    className="btn-danger text-sm py-2 px-4 flex items-center gap-1">
                    {deleting ? <Spinner size="sm" /> : 'Delete'}
                  </button>
                </RoleGuard>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                <button id="save-task-btn" onClick={handleSave} disabled={saving}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                  {saving ? <><Spinner size="sm" />Saving...</> : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card space-y-5">
        {/* Status */}
        <div>
          <p className="label">Status</p>
          {editing ? (
            <select id="detail-status" className="input-field max-w-xs" value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} />
              {isOverdue && <span className="badge-overdue">Overdue</span>}
            </div>
          )}
        </div>

        {/* Admin-only fields */}
        <RoleGuard allowedRoles={['ADMIN']}>
          {editing ? (
            <>
              <div>
                <label htmlFor="detail-title" className="label">Title</label>
                <input id="detail-title" className="input-field" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={100} />
              </div>
              <div>
                <label htmlFor="detail-desc" className="label">Description</label>
                <textarea id="detail-desc" className="input-field resize-none" rows={3}
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="detail-priority" className="label">Priority</label>
                  <select id="detail-priority" className="input-field" value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="detail-due" className="label">Due Date</label>
                  <input id="detail-due" type="date" className="input-field" value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label htmlFor="detail-project" className="label">Project</label>
                <select id="detail-project" className="input-field" value={form.projectId}
                  onChange={e => setForm(f => ({ ...f, projectId: e.target.value, assignedTo: '' }))}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="detail-assignee" className="label">Assignee</label>
                <select id="detail-assignee" className="input-field" value={form.assignedTo}
                  onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {task.description && (
                <div>
                  <p className="label">Description</p>
                  <p className="text-gray-300 text-sm">{task.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="label">Priority</p>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div>
                  <p className="label">Due Date</p>
                  <p className={`text-sm ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-300'}`}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="label">Project</p>
                  {task.project ? (
                    <Link to={`/projects/${task.project.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                      {task.project.name}
                    </Link>
                  ) : '—'}
                </div>
                <div>
                  <p className="label">Assignee</p>
                  <p className="text-sm text-gray-300">{task.assignee?.name || '—'}</p>
                </div>
              </div>
            </>
          )}
        </RoleGuard>

        {/* Member view — show read-only fields */}
        {!isAdmin && (
          <>
            {task.description && (
              <div>
                <p className="label">Description</p>
                <p className="text-gray-300 text-sm">{task.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Priority</p><PriorityBadge priority={task.priority} /></div>
              <div>
                <p className="label">Due Date</p>
                <p className={`text-sm ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-300'}`}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
            <div>
              <p className="label">Project</p>
              {task.project ? (
                <Link to={`/projects/${task.project.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm">
                  {task.project.name}
                </Link>
              ) : '—'}
            </div>
          </>
        )}

        <div className="pt-2 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Created {new Date(task.createdAt).toLocaleString()} · Last updated {new Date(task.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
