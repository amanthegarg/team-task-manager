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

function EditProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({ name: project.name, description: project.description || '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.put(`/projects/${project.id}`, form)
      toast.success('Project updated!')
      onSaved(res.data.data.project)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-5">Edit Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-proj-name" className="label">Project Name</label>
            <input id="edit-proj-name" className="input-field" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="edit-proj-desc" className="label">Description</label>
            <textarea id="edit-proj-desc" className="input-field resize-none" rows={3}
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [deletingMember, setDeletingMember] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => setProject(res.data.data.project))
      .catch(() => { toast.error('Project not found'); navigate('/projects') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleDeleteProject() {
    if (!window.confirm('Delete this project and all its tasks?')) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success('Project deleted')
      navigate('/projects')
    } catch { toast.error('Delete failed') }
  }

  async function handleRemoveMember(userId) {
    setDeletingMember(userId)
    try {
      await api.delete(`/projects/${id}/members/${userId}`)
      setProject(p => ({ ...p, members: p.members.filter(m => m.userId !== userId) }))
      toast.success('Member removed')
    } catch { toast.error('Failed to remove member') }
    finally { setDeletingMember(null) }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!project) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link to="/projects" className="hover:text-indigo-400 transition-colors">Projects</Link>
            <span>/</span>
            <span className="text-gray-200">{project.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          {project.description && <p className="text-gray-400 mt-1">{project.description}</p>}
          <p className="text-xs text-gray-500 mt-2">Created by {project.creator?.name} · {new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
        <RoleGuard allowedRoles={['ADMIN']}>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button id="edit-project-btn" onClick={() => setShowEdit(true)} className="btn-secondary text-sm py-2 px-4">Edit</button>
            <button id="delete-project-btn" onClick={handleDeleteProject} className="btn-danger text-sm py-2 px-4">Delete</button>
          </div>
        </RoleGuard>
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Members ({project.members.length})</h2>
          <RoleGuard allowedRoles={['ADMIN']}>
            <button id="add-member-btn" onClick={() => setShowAddMember(true)} className="btn-primary text-sm py-2 px-4">
              + Add Member
            </button>
          </RoleGuard>
        </div>
        {project.members.length === 0 ? (
          <p className="text-gray-500 text-sm">No members yet</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {project.members.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-sm font-bold">
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.user.name}</p>
                    <p className="text-xs text-gray-400">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={m.user.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}>{m.user.role}</span>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      disabled={deletingMember === m.userId}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded"
                      title="Remove member"
                    >
                      {deletingMember === m.userId ? <Spinner size="sm" /> : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </RoleGuard>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Tasks ({project.tasks?.length ?? 0})</h2>
          <RoleGuard allowedRoles={['ADMIN']}>
            <Link to={`/tasks/new?projectId=${id}`} className="btn-primary text-sm py-2 px-4 inline-block">
              + New Task
            </Link>
          </RoleGuard>
        </div>
        {(!project.tasks || project.tasks.length === 0) ? (
          <p className="text-gray-500 text-sm">No tasks in this project</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="table-header">Title</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header">Assignee</th>
                  <th className="table-header">Due</th>
                </tr>
              </thead>
              <tbody>
                {project.tasks.map(task => {
                  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                  return (
                    <tr key={task.id} className="table-row">
                      <td className="table-cell">
                        <Link to={`/tasks/${task.id}`} className="text-white hover:text-indigo-400 transition-colors font-medium">
                          {task.title}
                        </Link>
                        {overdue && <span className="ml-2 badge-overdue">Overdue</span>}
                      </td>
                      <td className="table-cell"><StatusBadge status={task.status} /></td>
                      <td className="table-cell"><PriorityBadge priority={task.priority} /></td>
                      <td className="table-cell text-gray-400 text-sm">{task.assignee?.name || '—'}</td>
                      <td className="table-cell text-xs text-gray-400">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEdit && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEdit(false)}
          onSaved={p => setProject(prev => ({ ...prev, ...p }))}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          projectId={id}
          existingMemberIds={project.members.map(m => m.userId)}
          onClose={() => setShowAddMember(false)}
          onAdded={m => setProject(p => ({ ...p, members: [...p.members, m] }))}
        />
      )}
    </div>
  )
}

function AddMemberModal({ projectId, existingMemberIds, onClose, onAdded }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get('/users', { params: { search } })
        setUsers(res.data.data.users)
      } catch { /* silent */ }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function handleAdd(userId) {
    setAdding(userId)
    try {
      const res = await api.post(`/projects/${projectId}/members`, { userId })
      toast.success('Member added!')
      onAdded(res.data.data.membership)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member')
    } finally { setAdding(null) }
  }

  const available = users.filter(u => !existingMemberIds.includes(u.id))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Add Member</h2>
        <input
          id="add-member-search"
          className="input-field mb-4"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : available.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              {search ? 'No users found' : 'All users are already members'}
            </p>
          ) : (
            available.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-sm font-bold">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAdd(u.id)}
                  disabled={adding === u.id}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  {adding === u.id ? <Spinner size="sm" /> : 'Add'}
                </button>
              </div>
            ))
          )}
        </div>
        <button onClick={onClose} className="btn-secondary w-full mt-4">Close</button>
      </div>
    </div>
  )
}
