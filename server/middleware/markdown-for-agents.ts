import { servers } from '../../data/servers'
import { SITE_NAME, siteUrl } from '../../utils/site'

// Markdown for Agents: requests carrying Accept: text/markdown get a markdown
// rendition instead of HTML. Content pages return their raw markdown (kept in
// the collections via the rawbody schema field); the homepage gets a summary
// generated from the server roster. Browsers never send text/markdown, so HTML
// stays the default.

function homepageMarkdown(discordUrl: string): string {
  const rows = servers.map(
    (s) => `| ${s.name} | ${s.version} | \`${s.hostname}\` | ${s.mapUrl ?? '—'} |`,
  )
  return [
    `# ${SITE_NAME}`,
    '',
    'A free, public, community-run modded Minecraft network for new and experienced',
    'players. No whitelist, no paywall — join instantly with the addresses below.',
    '',
    '## Servers',
    '',
    '| Server | Pack version | Join address | Live map |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
    '## Links',
    '',
    `- Documentation: ${siteUrl('/docs/getting-started')}`,
    `- Discord: ${discordUrl}`,
    `- Players online right now (JSON, network-wide): ${siteUrl('/api/online-players')}`,
    `- LLM-friendly overview: ${siteUrl('/llms.txt')} (full docs: ${siteUrl('/llms-full.txt')})`,
    `- API catalog: ${siteUrl('/.well-known/api-catalog')}`,
    '',
  ].join('\n')
}

export default defineEventHandler(async (event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return
  const accept = getHeader(event, 'accept') ?? ''
  if (!accept.includes('text/markdown')) return

  const path = event.path.split('?')[0]

  let markdown: string | undefined
  if (path === '/') {
    markdown = homepageMarkdown(useRuntimeConfig().public.discordUrl)
  } else if (path?.startsWith('/docs/') || path?.startsWith('/legal/')) {
    const collection = path.startsWith('/docs/') ? 'docs' as const : 'legal' as const
    const page = await queryCollection(event, collection).path(path).first().catch(() => null)
    markdown = page?.rawbody ?? undefined
  }
  if (!markdown) return

  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  setHeader(event, 'Vary', 'Accept')
  // Rough size hint for agents budgeting context (~4 chars per token).
  setHeader(event, 'X-Markdown-Tokens', String(Math.ceil(markdown.length / 4)))
  return markdown
})
