import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
const KEY = '90e86cc2731712427b7a8372856f674b'

const API_ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URLS_PER_REQUEST = 10_000
const PRODUCTION_BRANCH = 'master'

const SITEMAP_CANDIDATES = [
  join('.output', 'public', 'sitemap.xml'),
  join('dist', 'sitemap.xml'),
]
const HANDOFF_FILE = '.indexnow.json'

function parseSitemap(xml) {
  const entries = new Map()

  for (const block of xml.split('</url>')) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim()
    if (!loc) continue
    entries.set(loc, block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() ?? '')
  }

  return entries
}

async function readBuiltSitemap() {
  for (const candidate of SITEMAP_CANDIDATES) {
    const xml = await readFile(candidate, 'utf8').catch(() => null)
    if (xml) return { xml, path: candidate }
  }
  throw new Error(`no built sitemap in ${SITEMAP_CANDIDATES.join(' or ')} — did the build run?`)
}

async function snapshot() {
  const { xml, path } = await readBuiltSitemap()
  const built = parseSitemap(xml)
  if (!built.size) throw new Error(`${path} contained no URLs`)

  const { host, origin } = new URL(built.keys().next().value)

  const keyFile = `public/${KEY}.txt`
  const hosted = await readFile(keyFile, 'utf8').catch(() => null)
  if (hosted?.trim() !== KEY) {
    throw new Error(`${keyFile} is missing or does not contain the key — engines would reject the submission with 403`)
  }

  const response = await fetch(`${origin}/sitemap.xml`, {
    headers: { 'user-agent': `${host} build (IndexNow diff)` },
  })
  if (!response.ok) throw new Error(`GET ${origin}/sitemap.xml responded ${response.status}`)

  const live = parseSitemap(await response.text())
  if (!live.size) throw new Error('live sitemap contained no URLs')

  const changed = [...built].filter(([loc, lastmod]) => !live.has(loc) || live.get(loc) !== lastmod).map(([loc]) => loc)

  await write(changed, { host })
  console.log(
    changed.length
      ? `[indexnow] ${changed.length} of ${built.size} URLs changed since the live deploy:\n  ${changed.join('\n  ')}`
      : `[indexnow] no URLs changed since the live deploy`,
  )
}

async function submit() {
  const handoff = await readFile(HANDOFF_FILE, 'utf8').catch(() => null)
  if (!handoff) {
    console.log('[indexnow] no snapshot from the build step, skipping')
    return
  }

  const { host, urls } = JSON.parse(handoff)
  if (!urls?.length) {
    console.log('[indexnow] nothing to submit')
    return
  }

  // Preview builds produce the same production URLs but never go live. Pages
  // and Workers Builds name the branch differently; honour whichever is set.
  const branch = process.env.CF_PAGES_BRANCH ?? process.env.WORKERS_CI_BRANCH
  if ((process.env.CF_PAGES ?? process.env.WORKERS_CI) && branch !== PRODUCTION_BRANCH) {
    console.log(`[indexnow] branch "${branch ?? 'unknown'}" is not production, skipping`)
    return
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation: `https://${host}/${KEY}.txt`,
      urlList: urls.slice(0, MAX_URLS_PER_REQUEST),
    }),
  })

  // 200 accepted, 202 accepted with key validation still pending. Anything else
  // is worth reading in the build log: 403 = key not reachable, 422 = a URL is
  // off-host, 429 = submitting too much, too often.
  if (response.status === 200 || response.status === 202) {
    console.log(`[indexnow] submitted ${urls.length} URL(s), HTTP ${response.status}`)
    return
  }

  console.warn(`[indexnow] submission rejected with HTTP ${response.status}: ${(await response.text().catch(() => '')).slice(0, 200)}`)
}

async function write(urls, { host = '' } = {}) {
  await writeFile(HANDOFF_FILE, JSON.stringify({ host, urls }), 'utf8')
}

const mode = process.argv[2]

try {
  if (mode === '--snapshot') await snapshot()
  else if (mode === '--submit') await submit()
  else throw new Error(`unknown mode "${mode ?? ''}" — expected --snapshot or --submit`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.warn(`[indexnow] ${mode ?? 'run'} failed, submitting nothing: ${message}`)
  // Fail closed rather than guessing at the diff, and never break the deploy
  // over a search-engine ping.
  if (mode === '--snapshot') await write([]).catch(() => {})
}
