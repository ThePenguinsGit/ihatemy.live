// Xbox / Microsoft sign-in for Minecraft-account linking, via nuxt-auth-utils'
// built-in Microsoft (Entra) provider on the consumer endpoint (tenant is set to
// `consumers` in runtimeConfig). This route is both the login start and the
// OAuth callback; register https://ihatemy.live/auth/xbox as the redirect URI.
//
// The Minecraft resolution chain is split: this server runs the Microsoft-hosted
// half (Xbox Live → XSTS, server/utils/xbox.ts), then hands the resulting XSTS
// identity to PenguBot, which runs the Mojang half (login_with_xbox → profile)
// and mints the app JWT in one signed call. The Mojang calls cannot run here —
// this server is a Cloudflare Worker and api.minecraftservices.com 403s Worker
// traffic — and splitting there means PenguBot never sees the Microsoft tokens.
// The provider still insists on fetching a userinfo endpoint after the token
// exchange, so `userURL` points at a no-op route (/auth/xbox/resolve).
export default defineOAuthMicrosoftEventHandler({
  config: {
    scope: ['XboxLive.signin', 'offline_access'],
    userURL: '/auth/xbox/resolve',
    authorizationParams: { prompt: 'select_account' },
  },
  async onSuccess(event, { tokens }) {
    try {
      const xbox = await resolveXboxIdentity(tokens.access_token)
      const { apiToken, user: sessionUser, minecraftUuid } = await exchangeXboxProfile(event, xbox)
      await setUserSession(event, {
        user: { ...sessionUser, minecraftUuid },
        secure: { apiToken },
        loggedInAt: Date.now(),
      })
      return sendRedirect(event, '/')
    }
    catch (error) {
      console.error('Xbox exchange error:', error)
      if (error instanceof XboxExchangeError) {
        if (error.code === 'NOT_OWNED') return sendRedirect(event, '/login?error=minecraft_unowned')
        return sendRedirect(event, '/login?error=minecraft')
      }
      return sendRedirect(event, '/login?error=xbox')
    }
  },
  onError(event, error) {
    console.error('Xbox OAuth error:', error)
    return sendRedirect(event, '/login?error=xbox')
  },
})
