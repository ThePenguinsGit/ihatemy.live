// Internal endpoint used as the Microsoft provider's `userURL`
// (see server/routes/auth/xbox.get.ts). nuxt-auth-utils calls it with the Xbox
// access token as a Bearer header; we resolve the Minecraft account and return
// { uuid, name } as the "user". On failure we return { error: <code> } (HTTP
// 200) so the provider routes to onError with a code we can map to a message —
// see the onError handler in xbox.get.ts.
export default defineEventHandler(async (event) => {
  const token = (getHeader(event, 'authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return { error: 'RESOLVE_FAILED' }

  try {
    return await resolveMinecraftAccount(token)
  }
  catch (error) {
    if (error instanceof MinecraftResolveError) return { error: error.code }
    console.error('Minecraft resolution failed:', error)
    return { error: 'RESOLVE_FAILED' }
  }
})
