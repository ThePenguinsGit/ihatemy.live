// Discord sign-in (nuxt-auth-utils code flow). This single route is both the
// login start and the OAuth callback (the module detects `?code=`), so the
// redirect URI to register on the Discord app is https://ihatemy.live/auth/discord.
// PenguBot mints the app JWT from the profile (stubbed for now).
export default defineOAuthDiscordEventHandler({
  config: {
    scope: ['identify'],
  },
  async onSuccess(event, { user, tokens }) {
    const { apiToken, user: sessionUser, discordSnowflake } = await exchangeDiscordProfile(event, user, tokens)
    await setUserSession(event, {
      user: { ...sessionUser, discordSnowflake },
      secure: { apiToken },
      loggedInAt: Date.now(),
    })
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Discord OAuth error:', error)
    return sendRedirect(event, '/login?error=discord')
  },
})
