import type { User } from '#auth-utils'
import type { MinecraftAccount } from './minecraft'

// Integration layer for the PenguBot backend (penguin-bot.ihatemy.live), which
// owns account creation / login and the Minecraft-UUID resolution.
//
// Each function issues a SIGNED server-to-server request via penguFetch() so
// PenguBot can authenticate it as coming from this server (see penguFetch.ts).
// When no real signing key is configured (local dev with the dummy placeholder),
// they fall back to deterministic stub data so the whole auth flow still works
// end-to-end. The endpoint paths + response shapes below are the contract the
// PenguBot side needs to implement and verify against.

export interface AuthResult {
  /** PenguBot-minted JWT — stored server-only in the sealed session. */
  apiToken: string
  /** Decoded, client-safe claims for useUserSession().user. */
  user: User
}

// Expected PenguBot response for a sign-in/upsert.
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

interface PenguLinkResponse {
  minecraftUuid: string
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

/**
 * Discord OAuth succeeded. The website has verified this Discord profile via the
 * code flow, so it vouches for it in the signed request; PenguBot upserts the
 * account and mints the app JWT.
 */
export async function exchangeDiscordProfile(
  profile: DiscordProfile,
  tokens: OAuthTokens,
): Promise<AuthResult> {
  if (isPenguBackendConfigured()) {
    const res = await penguFetch<PenguAuthResponse>('/internal/auth/discord', {
      provider: 'discord',
      profile,
      tokens,
    })
    return toAuthResult(res, 'discord')
  }

  // ── dev stub ──
  const name = profile.global_name || profile.username || 'Penguin'
  return {
    apiToken: stubJwt({ id: profile.id, name, provider: 'discord' }),
    user: {
      id: profile.id,
      name,
      // Discord avatar hash — consumed as cdn.discordapp.com/avatars/<hash>.png.
      avatar: profile.avatar ?? '',
      donatorGroup: null,
      provider: 'discord',
      minecraftUuid: null,
    },
  }
}

/**
 * Xbox sign-in: the website already resolved the Minecraft account from the
 * Microsoft token (see resolveMinecraftAccount). PenguBot upserts/links the
 * account for this UUID and mints the app JWT.
 */
export async function exchangeXboxProfile(
  minecraft: MinecraftAccount,
): Promise<AuthResult & { minecraftUuid: string }> {
  if (isPenguBackendConfigured()) {
    const res = await penguFetch<PenguAuthResponse>('/internal/auth/xbox', {
      provider: 'xbox',
      minecraft,
    })
    const result = toAuthResult(res, 'xbox')
    return { ...result, minecraftUuid: result.user.minecraftUuid ?? minecraft.uuid }
  }

  // ── dev stub ──
  const id = `xbox:${minecraft.uuid}`
  return {
    apiToken: stubJwt({ id, name: minecraft.name, provider: 'xbox', minecraftUuid: minecraft.uuid }),
    user: {
      id,
      name: minecraft.name,
      avatar: '',
      donatorGroup: null,
      provider: 'xbox',
      minecraftUuid: minecraft.uuid,
    },
    minecraftUuid: minecraft.uuid,
  }
}

/**
 * An already-logged-in user linked their Xbox account. The website resolved the
 * Minecraft account; the signed request carries the user's app JWT so PenguBot
 * knows which account to attach the UUID to.
 */
export async function linkMinecraftForUser(
  apiToken: string,
  minecraft: MinecraftAccount,
): Promise<{ minecraftUuid: string }> {
  return await penguFetch<PenguLinkResponse>('/internal/link/minecraft', {
    apiToken,
    minecraft,
  })
}

// ── helpers ─────────────────────────────────────────────────────────────────

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

/** A JWT-shaped placeholder so the proxy has something to forward as Authorization. */
function stubJwt(claims: Record<string, unknown>): string {
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ ...claims, stub: true })}.stub`
}
