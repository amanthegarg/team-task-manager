import prisma from '../config/prisma.js'
import { addMemberSchema } from '../validators/projectValidators.js'

// POST /api/projects/:id/members
export async function addMember(req, res, next) {
  try {
    const { id: projectId } = req.params

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Project not found',
        error: `No project found with ID: ${projectId}`,
      })
    }

    const parsed = addMemberSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false, data: null,
        message: 'Validation failed',
        error: parsed.error.errors[0].message,
      })
    }

    const { userId } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    })
    if (!user) {
      return res.status(404).json({
        success: false, data: null,
        message: 'User not found',
        error: `No user found with ID: ${userId}`,
      })
    }

    const alreadyMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })
    if (alreadyMember) {
      return res.status(409).json({
        success: false, data: null,
        message: 'Already a member',
        error: 'This user is already a member of the project.',
      })
    }

    const membership = await prisma.projectMember.create({
      data: { projectId, userId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    return res.status(201).json({
      success: true, data: { membership },
      message: `${user.name} added to project successfully`, error: null,
    })
  } catch (err) { next(err) }
}

// DELETE /api/projects/:id/members/:userId
export async function removeMember(req, res, next) {
  try {
    const { id: projectId, userId } = req.params

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })
    if (!membership) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Member not found',
        error: 'This user is not a member of the project.',
      })
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    })

    return res.status(200).json({
      success: true, data: null,
      message: 'Member removed from project successfully', error: null,
    })
  } catch (err) { next(err) }
}
