import type { H3Event } from 'h3'
import type { User } from '#auth-utils'
import type { MinecraftAccount } from './minecraft'

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

export async function exchangeXboxProfile(
  event: H3Event,
  minecraft: MinecraftAccount,
): Promise<AuthResult & { minecraftUuid: string }> {
  const res = await penguFetch<PenguAuthResponse>('/internal/auth/xbox', {
    provider: 'xbox',
    minecraft,
  }, { event })
  const result = toAuthResult(res, 'xbox')
  return { ...result, minecraftUuid: result.user.minecraftUuid ?? minecraft.uuid }
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
