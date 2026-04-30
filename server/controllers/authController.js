import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'
import { signupSchema, loginSchema } from '../validators/authValidators.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// POST /api/auth/signup
export async function signup(req, res, next) {
  try {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Validation failed',
        error: parsed.error.errors[0].message,
      })
    }

    const { name, email, password, role } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Email already registered',
        error: 'A user with this email already exists.',
      })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    const token = signToken(user)
    res.cookie('token', token, COOKIE_OPTIONS)

    return res.status(201).json({
      success: true,
      data: { user },
      message: 'Account created successfully',
      error: null,
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Validation failed',
        error: parsed.error.errors[0].message,
      })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid credentials',
        error: 'No account found with that email address.',
      })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid credentials',
        error: 'The password you entered is incorrect.',
      })
    }

    const token = signToken(user)
    res.cookie('token', token, COOKIE_OPTIONS)

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      message: 'Logged in successfully',
      error: null,
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/logout
export async function logout(req, res, next) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })
    return res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully',
      error: null,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me
export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found',
        error: 'The authenticated user no longer exists.',
      })
    }

    return res.status(200).json({
      success: true,
      data: { user },
      message: 'User retrieved successfully',
      error: null,
    })
  } catch (err) {
    next(err)
  }
}
