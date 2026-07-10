import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '~/interfaces/JwtPayload'

// Authed catch-all proxy to the PenguBot backend. Everything under /api/**
// (except the local /api/docs handler, which is a more specific static route
// and wins over this wildcard) is forwarded to penguin-bot.ihatemy.live with
// the same path + query.
//
// The PenguBot JWT lives server-only in the sealed session (secure.apiToken);
// we inject it here as the raw `Authorization` value the backend expects. This
// replaces the old per-endpoint routeRules proxies and the inline Authorization
// headers that used to be sprinkled across the client. Public endpoints simply
// get no header (there's no session).
//
// Token rotation: if a proxied call mutates data that lives inside the JWT (name,
// avatar, donator group, …), PenguBot re-mints the token and returns it in the
// `x-pengu-token` response header. We adopt it before the response is flushed so
// the next request carries the fresh token and the client-visible `user` claims
// stay in sync — see onResponse below.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const path = getRouterParam(event, '_') ?? ''
  const target = `${config.public.apiBaseUrl}/${path}${getRequestURL(event).search}`

  const session = await getUserSession(event)
  const apiToken = session.secure?.apiToken
  const headers = apiToken ? { Authorization: apiToken } : undefined

  return proxyRequest(event, target, {
    headers,
    // Fires after the backend's response headers are copied but before its body
    // is streamed, so we can still write the session cookie on this response.
    async onResponse(event, response) {
      const rotated = response.headers.get('x-pengu-token')
      // Only act on a genuinely new token for an existing session.
      if (!rotated || !apiToken || rotated === apiToken) return

      // The rotated token is a bearer credential — it must never reach the
      // browser (the whole reason the JWT lives in the sealed, server-only
      // session). proxyRequest copies every backend header onto our response, so
      // strip it here and instead expose a non-sensitive flag telling the client
      // the session changed; the client refreshes useUserSession() off that.
      removeResponseHeader(event, 'x-pengu-token')
      setResponseHeader(event, 'x-pengu-session-refreshed', '1')

      // Refresh the client-readable claims from the new payload, keeping the
      // fields that aren't in the JWT (provider, minecraftUuid). A live apiToken
      // means we're logged in, so session.user is present.
      let user = session.user!
      try {
        const { id, name, avatar, donatorGroup } = jwtDecode<JwtPayload>(rotated)
        user = { ...user, id, name, avatar, donatorGroup }
      } catch {
        // Undecodable token: still adopt it so auth stays valid; leave user as-is.
      }

      // Spread the existing session so required fields (loggedInAt) are retained.
      await setUserSession(event, { ...session, user, secure: { ...session.secure, apiToken: rotated } })
    },
  })
})
