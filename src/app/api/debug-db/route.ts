import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function findFiles(dir: string, pattern: RegExp, maxDepth = 4, depth = 0): string[] {
  if (depth > maxDepth) return [];
  const results: string[] = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const full = path.join(dir, file);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules') {
            results.push(...findFiles(full, pattern, maxDepth, depth + 1));
          }
        } else if (pattern.test(file)) {
          results.push(full);
        }
      } catch {}
    }
  } catch {}
  return results;
}

export async function GET() {
  const cwd = process.cwd();
  const foundDb = findFiles(cwd, /\.db$/);
  const foundTmp = findFiles('/tmp', /\.db$/);

  return NextResponse.json({
    cwd,
    __dirname,
    foundDb,
    foundTmp,
    cwdFiles: fs.existsSync(cwd) ? fs.readdirSync(cwd) : [],
    prismaFiles: fs.existsSync(path.join(cwd, 'prisma')) ? fs.readdirSync(path.join(cwd, 'prisma')) : [],
    dbFiles: fs.existsSync(path.join(cwd, 'db')) ? fs.readdirSync(path.join(cwd, 'db')) : [],
  });
}
