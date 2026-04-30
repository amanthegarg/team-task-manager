import prisma from '../config/prisma.js'
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
} from '../validators/taskValidators.js'

const TASK_INCLUDE = {
  assignee: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true } },
}

// POST /api/tasks
export async function createTask(req, res, next) {
  try {
    const parsed = createTaskSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false, data: null,
        message: 'Validation failed',
        error: parsed.error.errors[0].message,
      })
    }

    const { projectId, assignedTo, dueDate, ...rest } = parsed.data

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Project not found',
        error: `No project found with ID: ${projectId}`,
      })
    }

    if (assignedTo) {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assignedTo } },
      })
      if (!membership) {
        return res.status(400).json({
          success: false, data: null,
          message: 'Invalid assignee',
          error: 'The assigned user must be a member of the project.',
        })
      }
    }

    const task = await prisma.task.create({
      data: {
        ...rest,
        projectId,
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: TASK_INCLUDE,
    })

    return res.status(201).json({
      success: true, data: { task },
      message: 'Task created successfully', error: null,
    })
  } catch (err) { next(err) }
}

// GET /api/tasks
export async function getTasks(req, res, next) {
  try {
    const { status, priority, overdue } = req.query
    const where = {}

    if (req.user.role === 'MEMBER') {
      where.assignedTo = req.user.id
    }

    if (status) where.status = status
    if (priority) where.priority = priority
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() }
      where.status = { not: 'DONE' }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: TASK_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({
      success: true, data: { tasks },
      message: 'Tasks retrieved successfully', error: null,
    })
  } catch (err) { next(err) }
}

// GET /api/tasks/:id
export async function getTaskById(req, res, next) {
  try {
    const { id } = req.params

    const task = await prisma.task.findUnique({
      where: { id },
      include: TASK_INCLUDE,
    })

    if (!task) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Task not found',
        error: `No task found with ID: ${id}`,
      })
    }

    if (req.user.role === 'MEMBER' && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false, data: null,
        message: 'Access denied',
        error: 'You can only view tasks assigned to you.',
      })
    }

    return res.status(200).json({
      success: true, data: { task },
      message: 'Task retrieved successfully', error: null,
    })
  } catch (err) { next(err) }
}

// PUT /api/tasks/:id
export async function updateTask(req, res, next) {
  try {
    const { id } = req.params

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Task not found',
        error: `No task found with ID: ${id}`,
      })
    }

    // MEMBER can only update status of their own task
    if (req.user.role === 'MEMBER') {
      if (task.assignedTo !== req.user.id) {
        return res.status(403).json({
          success: false, data: null,
          message: 'Access denied',
          error: 'You can only update tasks assigned to you.',
        })
      }

      const parsed = updateStatusSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          success: false, data: null,
          message: 'Validation failed',
          error: parsed.error.errors[0].message,
        })
      }

      const updated = await prisma.task.update({
        where: { id },
        data: { status: parsed.data.status },
        include: TASK_INCLUDE,
      })

      return res.status(200).json({
        success: true, data: { task: updated },
        message: 'Task status updated successfully', error: null,
      })
    }

    // ADMIN — full update
    const parsed = updateTaskSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false, data: null,
        message: 'Validation failed',
        error: parsed.error.errors[0].message,
      })
    }

    const { assignedTo, dueDate, projectId, ...rest } = parsed.data

    if (assignedTo && projectId) {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assignedTo } },
      })
      if (!membership) {
        return res.status(400).json({
          success: false, data: null,
          message: 'Invalid assignee',
          error: 'The assigned user must be a member of the project.',
        })
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(projectId && { projectId }),
        ...(assignedTo !== undefined && { assignedTo: assignedTo || null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: TASK_INCLUDE,
    })

    return res.status(200).json({
      success: true, data: { task: updated },
      message: 'Task updated successfully', error: null,
    })
  } catch (err) { next(err) }
}

// DELETE /api/tasks/:id
export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Task not found',
        error: `No task found with ID: ${id}`,
      })
    }

    await prisma.task.delete({ where: { id } })

    return res.status(200).json({
      success: true, data: null,
      message: 'Task deleted successfully', error: null,
    })
  } catch (err) { next(err) }
}
