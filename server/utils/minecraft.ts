// Resolves a Minecraft account (UUID + name) from a Microsoft OAuth access token,
// by walking the standard chain: Xbox Live (XBL) → XSTS → Minecraft services →
// profile. Server-side only. The token must come from the Microsoft identity
// platform v2 consumer flow (login.microsoftonline.com/consumers, as in
// server/routes/auth/xbox.get.ts), so it's passed to XBL raw (no `d=` prefix).

export interface MinecraftAccount {
  uuid: string
  name: string
}

interface XboxTokenResponse {
  Token: string
  DisplayClaims: { xui: { uhs: string }[] }
}

/** Thrown for expected, user-facing failures so the handler can map a message. */
export class MinecraftResolveError extends Error {
  constructor(public code: 'NO_XBOX_ACCOUNT' | 'NOT_OWNED' | 'XSTS_DENIED', message?: string) {
    super(message ?? code)
    this.name = 'MinecraftResolveError'
  }
}

export async function resolveMinecraftAccount(microsoftAccessToken: string): Promise<MinecraftAccount> {
  // api.minecraftservices.com sits behind Cloudflare, which 403s requests lacking
  // a normal User-Agent/Accept. Send both on every call.
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  const json = { 'content-type': 'application/json', 'accept': 'application/json', 'user-agent': ua }

  // 1. Xbox Live user token.
  const xbl = await $fetch<XboxTokenResponse>('https://user.auth.xboxlive.com/user/authenticate', {
    method: 'POST',
    headers: json,
    body: {
      Properties: {
        AuthMethod: 'RPS',
        SiteName: 'user.auth.xboxlive.com',
        // RPS delegation ticket — the `d=` prefix is required by Xbox Live
        // regardless of whether the token came from the v2 identity platform or
        // the legacy login.live.com endpoint.
        RpsTicket: `d=${microsoftAccessToken}`,
      },
      // Xbox Live identifier literal — must be http:// (it is NOT fetched).
      RelyingParty: 'http://auth.xboxlive.com',
      TokenType: 'JWT',
    },
  })

  // 2. XSTS token scoped to Minecraft services.
  let xsts: XboxTokenResponse
  try {
    xsts = await $fetch<XboxTokenResponse>('https://xsts.auth.xboxlive.com/xsts/authorize', {
      method: 'POST',
      headers: json,
      body: {
        Properties: { SandboxId: 'RETAIL', UserTokens: [xbl.Token] },
        RelyingParty: 'rp://api.minecraftservices.com/',
        TokenType: 'JWT',
      },
    })
  }
  catch (error) {
    // XSTS returns 401 + an XErr code for accounts that can't proceed.
    const xerr = (error as { data?: { XErr?: number } })?.data?.XErr
    if (xerr === 2148916233) throw new MinecraftResolveError('NO_XBOX_ACCOUNT', 'No Xbox account for this Microsoft account')
    if (xerr) throw new MinecraftResolveError('XSTS_DENIED', `XSTS denied (XErr ${xerr})`)
    throw error
  }

  const userHash = xsts.DisplayClaims.xui[0]?.uhs
  if (!userHash) throw new MinecraftResolveError('XSTS_DENIED', 'Missing user hash')

  // 3. Exchange for a Minecraft services token.
  let mc: { access_token: string }
  try {
    mc = await $fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
      method: 'POST',
      headers: json,
      body: { identityToken: `XBL3.0 x=${userHash};${xsts.Token}` },
    })
  }
  catch (error) {
    const status = (error as { status?: number, statusCode?: number })?.status
      ?? (error as { statusCode?: number })?.statusCode
    console.error('login_with_xbox failed:', status, (error as { data?: unknown })?.data)
    throw error
  }

  // 4. Fetch the profile (UUID + name). 404 => the account doesn't own Minecraft.
  let profile: { id: string, name: string }
  try {
    profile = await $fetch('https://api.minecraftservices.com/minecraft/profile', {
      headers: { 'authorization': `Bearer ${mc.access_token}`, 'accept': 'application/json', 'user-agent': ua },
    })
  }
  catch (error) {
    const status = (error as { status?: number, statusCode?: number })?.status
      ?? (error as { statusCode?: number })?.statusCode
    if (status === 404) throw new MinecraftResolveError('NOT_OWNED', 'This account does not own Minecraft')
    throw error
  }

  return { uuid: formatUuid(profile.id), name: profile.name }
}

/** Mojang returns the UUID undashed; normalize to 8-4-4-4-12. */
function formatUuid(id: string): string {
  if (id.includes('-')) return id
  return id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5')
}
