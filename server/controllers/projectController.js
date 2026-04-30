import prisma from '../config/prisma.js'
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidators.js'

const PROJECT_INCLUDE = {
  creator: { select: { id: true, name: true, email: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  },
  _count: { select: { tasks: true, members: true } },
}

// POST /api/projects
export async function createProject(req, res, next) {
  try {
    const parsed = createProjectSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false, data: null,
        message: 'Validation failed',
        error: parsed.error.errors[0].message,
      })
    }

    const project = await prisma.project.create({
      data: { ...parsed.data, createdBy: req.user.id },
      include: PROJECT_INCLUDE,
    })

    return res.status(201).json({
      success: true, data: { project },
      message: 'Project created successfully', error: null,
    })
  } catch (err) { next(err) }
}

// GET /api/projects
export async function getProjects(req, res, next) {
  try {
    let projects

    if (req.user.role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: PROJECT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      })
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: { some: { userId: req.user.id } },
        },
        include: PROJECT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      })
    }

    return res.status(200).json({
      success: true, data: { projects },
      message: 'Projects retrieved successfully', error: null,
    })
  } catch (err) { next(err) }
}

// GET /api/projects/:id
export async function getProjectById(req, res, next) {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        ...PROJECT_INCLUDE,
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!project) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Project not found',
        error: `No project found with ID: ${id}`,
      })
    }

    // MEMBER access check
    if (req.user.role === 'MEMBER') {
      const isMember = project.members.some(m => m.userId === req.user.id)
      if (!isMember) {
        return res.status(403).json({
          success: false, data: null,
          message: 'Access denied',
          error: 'You are not a member of this project.',
        })
      }
    }

    return res.status(200).json({
      success: true, data: { project },
      message: 'Project retrieved successfully', error: null,
    })
  } catch (err) { next(err) }
}

// PUT /api/projects/:id
export async function updateProject(req, res, next) {
  try {
    const { id } = req.params

    const exists = await prisma.project.findUnique({ where: { id } })
    if (!exists) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Project not found',
        error: `No project found with ID: ${id}`,
      })
    }

    const parsed = updateProjectSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false, data: null,
        message: 'Validation failed',
        error: parsed.error.errors[0].message,
      })
    }

    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
      include: PROJECT_INCLUDE,
    })

    return res.status(200).json({
      success: true, data: { project },
      message: 'Project updated successfully', error: null,
    })
  } catch (err) { next(err) }
}

// DELETE /api/projects/:id
export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params

    const exists = await prisma.project.findUnique({ where: { id } })
    if (!exists) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Project not found',
        error: `No project found with ID: ${id}`,
      })
    }

    await prisma.project.delete({ where: { id } })

    return res.status(200).json({
      success: true, data: null,
      message: 'Project deleted successfully', error: null,
    })
  } catch (err) { next(err) }
}
