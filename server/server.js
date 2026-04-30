import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'

import logger from './utils/logger.js'
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ✅ Railway PORT (IMPORTANT)
const PORT = process.env.PORT || 3000

// ─── CORS (FIXED FOR PRODUCTION) ──────────────────────────────────────────────
app.use(cors({
  origin: true, // allows same domain (Railway)
  credentials: true,
}))

// ─── Body & Cookie Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// ─── Rate Limiting (SAFE FOR 100 USERS) ───────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // increased for production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many requests',
    error: 'Too many requests from this IP. Please try again later.',
  },
})

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', userRoutes)

// ─── Serve Frontend (PRODUCTION FIXED) ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist')

  app.use(express.static(distPath))

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ─── Health Check (Railway stability) ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' })
})

// ─── 404 & Error Handler ──────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ─── Start Server (RAILWAY SAFE) ──────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
})

export default app