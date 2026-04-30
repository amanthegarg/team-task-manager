import { PrismaClient } from '@prisma/client'
import logger from '../utils/logger.js'

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

prisma.$connect()
  .then(() => logger.info('Database connected successfully'))
  .catch((err) => logger.error('Database connection failed:', err))

export default prisma
