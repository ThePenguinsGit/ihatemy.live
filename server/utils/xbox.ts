import { XboxExchangeError } from './pengubot'

export interface XboxIdentity {
  /** User hash (DisplayClaims.xui[0].uhs) — PenguBot needs it for login_with_xbox. */
  userHash: string
  /** XSTS token scoped to rp://api.minecraftservices.com/. */
  xstsToken: string
}

interface XboxTokenResponse {
  Token: string
  DisplayClaims: { xui: { uhs: string }[] }
}

export async function resolveXboxIdentity(microsoftAccessToken: string): Promise<XboxIdentity> {
  const json = { 'content-type': 'application/json', 'accept': 'application/json' }

  // 1. Xbox Live user token.
  const xbl = await $fetch<XboxTokenResponse>('https://user.auth.xboxlive.com/user/authenticate', {
    method: 'POST',
    headers: json,
    body: {
      Properties: {
        AuthMethod: 'RPS',
        SiteName: 'user.auth.xboxlive.com',
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
    if (xerr === 2148916233) throw new XboxExchangeError('NO_XBOX_ACCOUNT')
    if (xerr) throw new XboxExchangeError('XSTS_DENIED')
    throw error
  }

  const userHash = xsts.DisplayClaims.xui[0]?.uhs
  if (!userHash) throw new XboxExchangeError('XSTS_DENIED')

  return { userHash, xstsToken: xsts.Token }
}
