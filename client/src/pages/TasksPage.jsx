import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
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

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', priority: '', overdue: false })

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.overdue) params.overdue = 'true'

    api.get('/tasks', { params })
      .then(res => setTasks(res.data.data.tasks))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [filters])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-gray-400 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <RoleGuard allowedRoles={['ADMIN']}>
          <Link id="new-task-btn" to="/tasks/new" className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Link>
        </RoleGuard>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-400 font-medium">Filter:</span>

        <select
          id="filter-status"
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.status}
          onChange={e => setFilter('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        <select
          id="filter-priority"
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.priority}
          onChange={e => setFilter('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            id="filter-overdue"
            type="checkbox"
            className="w-4 h-4 rounded accent-red-500"
            checked={filters.overdue}
            onChange={e => setFilter('overdue', e.target.checked)}
          />
          <span className="text-sm text-gray-300">Overdue only</span>
        </label>

        {(filters.status || filters.priority || filters.overdue) && (
          <button
            id="clear-filters"
            onClick={() => setFilters({ status: '', priority: '', overdue: false })}
            className="text-xs text-gray-400 hover:text-white transition-colors underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Tasks table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">No tasks found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="table-header">Title</th>
                  <th className="table-header">Project</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header">Assignee</th>
                  <th className="table-header">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                  return (
                    <tr key={task.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to={`/tasks/${task.id}`} className="font-medium text-white hover:text-indigo-400 transition-colors">
                            {task.title}
                          </Link>
                          {overdue && <span className="badge-overdue">Overdue</span>}
                        </div>
                      </td>
                      <td className="table-cell">
                        {task.project ? (
                          <Link to={`/projects/${task.project.id}`} className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
                            {task.project.name}
                          </Link>
                        ) : '—'}
                      </td>
                      <td className="table-cell"><StatusBadge status={task.status} /></td>
                      <td className="table-cell"><PriorityBadge priority={task.priority} /></td>
                      <td className="table-cell text-gray-400 text-sm">{task.assignee?.name || '—'}</td>
                      <td className={`table-cell text-sm ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
