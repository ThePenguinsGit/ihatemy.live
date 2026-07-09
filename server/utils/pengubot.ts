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
  profile: DiscordProfile,
  tokens: OAuthTokens,
): Promise<AuthResult> {
  const res = await penguFetch<PenguAuthResponse>('/internal/auth/discord', {
    provider: 'discord',
    profile,
    tokens,
  })
  return toAuthResult(res, 'discord')
}

export async function exchangeXboxProfile(
  minecraft: MinecraftAccount,
): Promise<AuthResult & { minecraftUuid: string }> {
  const res = await penguFetch<PenguAuthResponse>('/internal/auth/xbox', {
    provider: 'xbox',
    minecraft,
  })
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
      minecraftUuid: res.user.minecraftUuid ?? null,
    },
  }
}
