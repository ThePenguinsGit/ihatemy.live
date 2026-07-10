import type { H3Event } from 'h3'
import type { User } from '#auth-utils'
import type { XboxIdentity } from './xbox'

export interface AuthResult {
  apiToken: string
  user: User
}

interface PenguAuthResponse {
  token: string
  user: {
    id: string
    name: string
    avatar: string
    donatorGroup: string | null
    discordSnowflake?: string | null
    minecraftUuid?: string | null
  }
}

interface DiscordProfile {
  id: string
  username?: string
  global_name?: string
  avatar?: string | null
}

interface OAuthTokens {
  access_token: string
  refresh_token?: string
}

export async function exchangeDiscordProfile(
  event: H3Event,
  profile: DiscordProfile,
  tokens: OAuthTokens,
): Promise<AuthResult & { discordSnowflake: string }> {
  const res = await penguFetch<PenguAuthResponse>('/internal/auth/discord', {
    provider: 'discord',
    profile,
    tokens,
  }, { event })
  const result = toAuthResult(res, 'discord')
  return { ...result, discordSnowflake: result.user.discordSnowflake ?? profile.id }
}

/**
 * Expected failure codes while resolving the Minecraft account. NO_XBOX_ACCOUNT
 * and XSTS_DENIED are thrown locally (server/utils/xbox.ts); NOT_OWNED and
 * RESOLVE_FAILED come from PenguBot as `{ error: <code> }` on a non-2xx response.
 */
const XBOX_EXCHANGE_ERROR_CODES = ['NO_XBOX_ACCOUNT', 'NOT_OWNED', 'XSTS_DENIED', 'RESOLVE_FAILED'] as const
export type XboxExchangeErrorCode = typeof XBOX_EXCHANGE_ERROR_CODES[number]

/** Thrown for expected, user-facing failures so the handler can map a message. */
export class XboxExchangeError extends Error {
  constructor(public code: XboxExchangeErrorCode) {
    super(code)
    this.name = 'XboxExchangeError'
  }
}

export async function exchangeXboxProfile(
  event: H3Event,
  xbox: XboxIdentity,
): Promise<AuthResult & { minecraftUuid: string }> {
  let res: PenguAuthResponse
  try {
    res = await penguFetch<PenguAuthResponse>('/internal/auth/xbox', {
      provider: 'xbox',
      xbox: { userHash: xbox.userHash, xstsToken: xbox.xstsToken },
    }, { event })
  }
  catch (error) {
    const code = (error as { data?: { error?: string } })?.data?.error
    if (XBOX_EXCHANGE_ERROR_CODES.includes(code as XboxExchangeErrorCode)) {
      throw new XboxExchangeError(code as XboxExchangeErrorCode)
    }
    throw error
  }
  const result = toAuthResult(res, 'xbox')
  if (!result.user.minecraftUuid) throw new XboxExchangeError('RESOLVE_FAILED')
  return { ...result, minecraftUuid: result.user.minecraftUuid }
}

function toAuthResult(res: PenguAuthResponse, provider: 'discord' | 'xbox'): AuthResult {
  return {
    apiToken: res.token,
    user: {
      id: res.user.id,
      name: res.user.name,
      avatar: res.user.avatar,
      donatorGroup: res.user.donatorGroup ?? null,
      provider,
      discordSnowflake: res.user.discordSnowflake ?? null,
      minecraftUuid: res.user.minecraftUuid ?? null,
    },
  }
}
