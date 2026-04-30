import prisma from '../config/prisma.js'

// GET /api/dashboard
export async function getDashboard(req, res, next) {
  try {
    const isAdmin = req.user.role === 'ADMIN'
    const userId = req.user.id
    const now = new Date()

    // ── Base filter for MEMBER (only their tasks) ──────────────────
    const taskFilter = isAdmin ? {} : { assignedTo: userId }
    const overdueFilter = {
      ...taskFilter,
      dueDate: { lt: now },
      status: { not: 'DONE' },
    }

    // ── Run queries in parallel for performance ────────────────────
    const [
      totalTasks,
      todoCount,
      inProgressCount,
      doneCount,
      overdueTasks,
      myTasks,
      recentActivity,
    ] = await Promise.all([
      prisma.task.count({ where: taskFilter }),
      prisma.task.count({ where: { ...taskFilter, status: 'TODO' } }),
      prisma.task.count({ where: { ...taskFilter, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...taskFilter, status: 'DONE' } }),
      prisma.task.findMany({
        where: overdueFilter,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.task.findMany({
        where: { assignedTo: userId },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
      prisma.task.findMany({
        where: taskFilter,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ])

    return res.status(200).json({
      success: true,
      data: {
        totalTasks,
        byStatus: { TODO: todoCount, IN_PROGRESS: inProgressCount, DONE: doneCount },
        overdueTasks,
        myTasks,
        recentActivity,
      },
      message: 'Dashboard data retrieved successfully',
      error: null,
    })
  } catch (err) { next(err) }
}
