import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const DEFAULT_TURSO_URL = 'libsql://fhbsports-asmahasanmuhammad.aws-ap-southeast-1.turso.io'
const DEFAULT_TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTQ2NTE2MzIsImlkIjoiMDFhMWQ5ODctNjAwMS03NjFiLWEwMTktNDU1OWJiN2U0YzdiIiwia2lkIjoiZjcwSXQwSTd6SU5LOTdldGZYSmIzUzU3U3NNOEZCc1I4c3h3WkZIWW9xNCIsInJpZCI6ImIwZmE1NzA3LTQ0ZWEtNGFlMy1iNTdkLTQwNzg5NjY3NjI2YSJ9.ionW1-XeO2qMRMhuJPqKfI09ShRIgkkej69wR2Wyj8tde6HvO9Rkhb0jEph8z0MYnhMtYHnXeT-Hbhw0ZsyoBQ'

function createPrismaClient(): PrismaClient {
  // Ensure DATABASE_URL is defined so Prisma engine validator doesn't throw URL_INVALID
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db'
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL || DEFAULT_TURSO_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN

  if (tursoUrl && tursoToken) {
    try {
      const adapter = new PrismaLibSql(
        {
          url: tursoUrl,
          authToken: tursoToken,
        },
        { timestampFormat: 'unixepoch-ms' }
      )
      return new PrismaClient({
        adapter,
        log: ['error', 'warn'],
      })
    } catch (err) {
      console.error('[db] Error creating LibSQL adapter for Turso:', err)
    }
  }

  // Fallback for local development if Turso credentials are missing
  const localDb = path.join(process.cwd(), 'db', 'custom.db')
  return new PrismaClient({
    datasources: {
      db: {
        url: `file:${localDb}?connection_limit=1`,
      },
    },
    log: ['error', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
