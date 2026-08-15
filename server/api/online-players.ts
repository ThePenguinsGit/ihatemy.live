import type McStatsResultInterface from '~/interfaces/McStatsResultInterface'
import type ServerStatusInterface from '~/interfaces/ServerStatusInterface'
import { serverHostname } from '~/utils/site'

interface ServerPlayerCount {
  shortName: string
  displayName: string
  joinAddress: string
  version: string
  online: boolean
  playersOnline: number
  playerSlots: number | null
}

export default defineCachedEventHandler(
  async (event) => {
    setHeader(event, 'Access-Control-Allow-Origin', '*')

    const apiBaseUrl = useRuntimeConfig(event).public.apiBaseUrl
    const servers = await $fetch<ServerStatusInterface[]>('/all-alive-servers', {
      baseURL: apiBaseUrl,
    })

    const rows: ServerPlayerCount[] = await Promise.all(
      servers.map(async (server) => {
        const status = await $fetch<McStatsResultInterface>('/server-status', {
          baseURL: apiBaseUrl,
          query: { hostname: server.shortName },
        }).catch(() => null)

        const online = status?.online === true && status.players.max !== null

        return {
          shortName: server.shortName,
          displayName: server.displayName,
          joinAddress: serverHostname(server.shortName),
          version: server.version,
          online,
          playersOnline: online ? status!.players.online : 0,
          playerSlots: online ? status!.players.max : null,
        }
      }),
    )

    return {
      checkedAt: new Date().toISOString(),
      playersOnline: rows.reduce((sum, row) => sum + row.playersOnline, 0),
      serversOnline: rows.filter((row) => row.online).length,
      serversTotal: rows.length,
      servers: rows,
    }
  },
  { maxAge: 20, name: 'online-players', getKey: () => 'all' },
)
