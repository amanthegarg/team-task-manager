import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Spinner from '../components/Spinner'

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`stat-card border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{label}</p>
          <p className="text-4xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    TODO: 'badge-todo',
    IN_PROGRESS: 'badge-in-progress',
    DONE: 'badge-done',
  }
  const labels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }
  return <span className={map[status]}>{labels[status]}</span>
}

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your team's task overview at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={data.totalTasks} icon="📋" color="border-indigo-500" />
        <StatCard label="To Do" value={data.byStatus.TODO} icon="🔲" color="border-gray-500" />
        <StatCard label="In Progress" value={data.byStatus.IN_PROGRESS} icon="⚡" color="border-yellow-500" />
        <StatCard label="Done" value={data.byStatus.DONE} icon="✅" color="border-green-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-red-400">⚠</span> Overdue Tasks
            {data.overdueTasks.length > 0 && (
              <span className="badge-overdue">{data.overdueTasks.length}</span>
            )}
          </h2>
          {data.overdueTasks.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">🎉 No overdue tasks!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="table-header">Task</th>
                    <th className="table-header">Project</th>
                    <th className="table-header">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overdueTasks.map(task => (
                    <tr key={task.id} className="table-row">
                      <td className="table-cell">
                        <Link to={`/tasks/${task.id}`} className="text-white hover:text-indigo-400 transition-colors font-medium">
                          {task.title}
                        </Link>
                        <span className="ml-2 badge-overdue">Overdue</span>
                      </td>
                      <td className="table-cell text-gray-400">{task.project?.name}</td>
                      <td className="table-cell text-red-400 text-xs">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🕐</span> Recent Activity
          </h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link to={`/tasks/${task.id}`} className="text-sm font-medium text-white hover:text-indigo-400 transition-colors truncate block">
                      {task.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{task.project?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {isOverdue(task) && <span className="badge-overdue">Overdue</span>}
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🎯</span> My Tasks
          </h2>
          <Link to="/tasks" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View all →
          </Link>
        </div>
        {data.myTasks.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No tasks assigned to you</p>
        ) : (
          <div className="space-y-2">
            {data.myTasks.slice(0, 6).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <Link to={`/tasks/${task.id}`} className="text-sm font-medium text-gray-200 group-hover:text-indigo-400 transition-colors truncate block">
                    {task.title}
                  </Link>
                  <p className="text-xs text-gray-500">{task.project?.name}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {isOverdue(task) && <span className="badge-overdue">Overdue</span>}
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
