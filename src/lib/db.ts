import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { SQLITE_DB_B64 } from './sqlite-data'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function resolveDbUrl(): string {
  // If an external database URL is explicitly provided (Postgres/MySQL/etc), use it
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL
  }

  // On Vercel / serverless environment
  if (process.env.VERCEL) {
    const tmpDb = '/tmp/custom.db'
    if (!fs.existsSync(tmpDb)) {
      try {
        console.log('[db] Unpacking bundled SQLite DB to /tmp/custom.db ...')
        const buf = Buffer.from(SQLITE_DB_B64, 'base64')
        fs.writeFileSync(tmpDb, buf)
        console.log(`[db] Successfully unpacked ${buf.length} bytes to /tmp/custom.db`)
      } catch (err) {
        console.error('[db] Error unpacking sqlite db:', err)
      }
    }
    return `file:${tmpDb}?connection_limit=1`
  }

  // Local development fallback
  const localDb = path.join(process.cwd(), 'db', 'custom.db')
  return `file:${localDb}?connection_limit=1`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDbUrl(),
      },
    },
    log: ['error', 'warn'],
  })

globalForPrisma.prisma = db
