import type McStatsResultInterface from '~/interfaces/McStatsResultInterface'
import type ServerStatusInterface from '~/interfaces/ServerStatusInterface'
import { SITE_DOMAIN, SITE_NAME } from '~/utils/site'

// WebMCP (https://webmachinelearning.github.io/webmcp/): exposes the site's
// read-only actions as tools to browser-integrated AI agents. The API only
// exists in browsers shipping the Web Model Context proposal, so everything is
// behind a feature check and browsers without it pay nothing.

const asText = (value: unknown) => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
})

export default defineNuxtPlugin(() => {
  const modelContext = (navigator as any).modelContext
  if (typeof modelContext?.provideContext !== 'function') return

  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl

  modelContext.provideContext({
    tools: [
      {
        name: 'list-servers',
        description:
          `List all Minecraft servers of ${SITE_NAME} with display name, short name, pack version, status, and tags. Servers are joinable at <shortName>.${SITE_DOMAIN}.`,
        inputSchema: { type: 'object', properties: {} },
        async execute() {
          const servers = await $fetch<ServerStatusInterface[]>(
            '/all-alive-servers',
            { baseURL: apiBaseUrl },
          )
          return asText(servers)
        },
      },
      {
        name: 'get-server-status',
        description:
          'Get the live status (online/offline and player counts) of one Penguin Network Minecraft server. For the whole network at once, use check-online-players instead.',
        inputSchema: {
          type: 'object',
          properties: {
            hostname: {
              type: 'string',
              description:
                'Short name of the server as returned by list-servers, e.g. "atm10".',
            },
          },
          required: ['hostname'],
        },
        async execute({ hostname }: { hostname: string }) {
          const status = await $fetch<McStatsResultInterface>('/server-status', {
            baseURL: apiBaseUrl,
            query: { hostname },
          })
          return asText(status)
        },
      },
      {
        name: 'check-online-players',
        description:
          `Check how many players are online right now on ${SITE_NAME}, across the whole network in one call: total players online, how many servers are up, and a per-server breakdown with player counts, slots, and join address. Use this to answer "is anyone playing?", "how busy is the network?" or "which server is most active?" instead of calling get-server-status for every server. Player names are not published, so this cannot tell whether one specific player is online.`,
        inputSchema: { type: 'object', properties: {} },
        async execute() {
          const snapshot = await $fetch('/api/online-players')
          return asText(snapshot)
        },
      },
      {
        name: 'list-docs',
        description:
          `List all documentation pages of ${SITE_NAME} (server guides, rules, ranks, FAQ) with their URLs. Fetch a page with Accept: text/markdown for a markdown version.`,
        inputSchema: { type: 'object', properties: {} },
        async execute() {
          const docs = await $fetch('/api/docs')
          return asText(docs)
        },
      },
    ],
  })
})
