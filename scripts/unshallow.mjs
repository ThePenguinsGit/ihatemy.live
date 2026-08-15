import { execFileSync } from 'node:child_process'

const git = (args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

try {
  if (git(['rev-parse', '--is-shallow-repository']) !== 'true') {
    console.log('[unshallow] clone already has full history, nothing to do')
    process.exit(0)
  }

  try {
    git(['fetch', '--unshallow', '--filter=blob:none'])
  } catch {
    // Partial clone can be refused server-side; a plain unshallow still works,
    // it just also pulls historical blobs.
    git(['fetch', '--unshallow'])
  }

  console.log('[unshallow] history restored, sitemap lastmod will use real commit dates')
} catch (error) {
  console.warn(
    '[unshallow] could not deepen the clone, lastmod will be omitted from the sitemap:',
    error instanceof Error ? error.message : error,
  )
}
