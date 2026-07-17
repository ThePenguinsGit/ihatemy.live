interface SkillIndexEntry {
  name: string
  type: 'skill-md'
  description: string
  url: string
  digest: string
}

function parseFrontmatter(markdown: string): Record<string, string> {
  const block = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
  const fields: Record<string, string> = {}
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^(\w[\w-]*):\s*(.+)$/)
    if (match) fields[match[1]] = match[2].trim()
  }
  return fields
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}

async function buildIndex() {
  const storage = useStorage('assets:agent-skills')
  const skills: SkillIndexEntry[] = []

  const keys = (await storage.getKeys()).filter((key) => key.endsWith(':SKILL.md')).sort()
  for (const key of keys) {
    const raw = await storage.getItemRaw(key)
    if (!raw) continue
    const bytes = new Uint8Array(raw as ArrayBuffer)
    const dirName = key.split(':').slice(0, -1).join('/')
    const frontmatter = parseFrontmatter(new TextDecoder().decode(bytes))
    if (!frontmatter.description) continue
    skills.push({
      name: frontmatter.name ?? dirName,
      type: 'skill-md',
      description: frontmatter.description,
      url: `/.well-known/agent-skills/${dirName}/SKILL.md`,
      digest: `sha256:${await sha256Hex(bytes)}`,
    })
  }

  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills,
  }
}

let index: ReturnType<typeof buildIndex> | undefined

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  index ??= buildIndex()
  return index
})
