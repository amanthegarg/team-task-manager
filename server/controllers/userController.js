import prisma from '../config/prisma.js'

// GET /api/users — list all users (ADMIN only, for member search modal)
export async function getUsers(req, res, next) {
  try {
    const { search } = req.query
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    })

    return res.status(200).json({
      success: true,
      data: { users },
      message: 'Users retrieved successfully',
      error: null,
    })
  } catch (err) { next(err) }
}
