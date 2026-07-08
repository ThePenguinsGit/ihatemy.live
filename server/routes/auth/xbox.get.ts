// Xbox / Microsoft sign-in for Minecraft-account linking, via nuxt-auth-utils'
// built-in Microsoft (Entra) provider on the consumer endpoint (tenant is set to
// `consumers` in runtimeConfig). This route is both the login start and the
// OAuth callback; register https://ihatemy.live/auth/xbox as the redirect URI.
//
// An XboxLive.signin access token can't hit any standard Microsoft userinfo
// endpoint, so we repoint the provider's `userURL` at our own internal route
// (/auth/xbox/resolve), which runs the Xbox Live → XSTS → Minecraft chain and
// returns the resolved { uuid, name }. That value arrives here as `user`.
export default defineOAuthMicrosoftEventHandler({
  config: {
    scope: ['XboxLive.signin', 'offline_access'],
    userURL: '/auth/xbox/resolve',
    authorizationParams: { prompt: 'select_account' },
  },
  async onSuccess(event, { user }) {
    const minecraft = user as { uuid: string, name: string }

    // Already signed in → link mode: attach the Minecraft UUID to this account.
    const existing = await getUserSession(event)
    if (existing.user) {
      const { minecraftUuid } = await linkMinecraftForUser(existing.secure?.apiToken ?? '', minecraft)
      await setUserSession(event, {
        ...existing,
        user: { ...existing.user, minecraftUuid },
      })
      return sendRedirect(event, '/')
    }

    // Otherwise → full sign-in + auto-link.
    const { apiToken, user: sessionUser } = await exchangeXboxProfile(minecraft)
    await setUserSession(event, {
      user: sessionUser,
      secure: { apiToken },
      loggedInAt: Date.now(),
    })
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    // Errors from the resolve route surface as error.data = { error: <code> }.
    const code = (error.data as { error?: string } | undefined)?.error
    if (code === 'NOT_OWNED') return sendRedirect(event, '/login?error=minecraft_unowned')
    if (code === 'NO_XBOX_ACCOUNT' || code === 'XSTS_DENIED' || code === 'RESOLVE_FAILED') {
      return sendRedirect(event, '/login?error=minecraft')
    }
    console.error('Xbox OAuth error:', error)
    return sendRedirect(event, '/login?error=xbox')
  },
})
