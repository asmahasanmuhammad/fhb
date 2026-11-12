import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function resolveDbUrl(): string {
  // If an external database URL is explicitly provided (Postgres/MySQL/etc), use it
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL
  }

  // On Vercel (or any read-only serverless environment), copy SQLite DB to /tmp
  if (process.env.VERCEL) {
    const tmpDb = '/tmp/custom.db'
    if (!fs.existsSync(tmpDb)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'custom.db'),
        path.join(process.cwd(), 'db', 'custom.db'),
        path.resolve('./prisma/custom.db'),
        path.resolve('./db/custom.db'),
        path.join(__dirname, '..', '..', '..', 'prisma', 'custom.db'),
        path.join(__dirname, '..', '..', '..', 'db', 'custom.db'),
      ]
      let copied = false
      for (const src of candidates) {
        if (fs.existsSync(src)) {
          console.log(`[db] Initializing /tmp/custom.db from ${src}`)
          try {
            fs.copyFileSync(src, tmpDb)
            copied = true
            break
          } catch (e) {
            console.error(`[db] Failed copying from ${src}:`, e)
          }
        }
      }
      if (!copied) {
        console.warn('[db] No existing custom.db found among candidates:', candidates)
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
