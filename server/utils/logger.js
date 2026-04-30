/**
 * Logger utility — only logs in development mode.
 * Use this instead of console.log throughout the codebase.
 */
const isDev = process.env.NODE_ENV !== 'production'

const logger = {
  info: (...args) => { if (isDev) console.info('[INFO]', ...args) },
  warn: (...args) => { if (isDev) console.warn('[WARN]', ...args) },
  error: (...args) => { if (isDev) console.error('[ERROR]', ...args) },
  debug: (...args) => { if (isDev) console.debug('[DEBUG]', ...args) },
}

export default logger
