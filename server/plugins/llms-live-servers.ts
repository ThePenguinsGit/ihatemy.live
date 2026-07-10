import type ServerStatusInterface from '~/interfaces/ServerStatusInterface'

const FALLBACK =
  'All the Mods 10, ATM10: To the Sky, GregTech: New Horizons, MC Eternal 2, Prominence 2, StoneBlock 4, and Society: Sunlit Valley'

function formatList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

export default defineNitroPlugin((nitroApp) => {
  const getServerNames = defineCachedFunction(
    async () => {
      const servers = await $fetch<ServerStatusInterface[]>('/all-alive-servers', {
        baseURL: useRuntimeConfig().public.apiBaseUrl,
      })
      return formatList(servers.map((s) => s.displayName))
    },
    { maxAge: 300, name: 'llms-server-names', getKey: () => 'all' },
  )

  const inject = async (_event: unknown, options: { description?: string, sections?: { description?: string }[] }) => {
    const names = (await getServerNames().catch(() => '')) || FALLBACK
    options.description = options.description?.replaceAll('{servers}', names)
    for (const section of options.sections ?? []) {
      section.description = section.description?.replaceAll('{servers}', names)
    }
  }

  nitroApp.hooks.hook('llms:generate', inject)
  nitroApp.hooks.hook('llms:generate:full', inject)
})
