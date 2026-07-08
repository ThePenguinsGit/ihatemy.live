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

  const { secure } = await getUserSession(event)
  const headers = secure?.apiToken ? { Authorization: secure.apiToken } : undefined

  return proxyRequest(event, target, {
    headers,
    // Fires after the backend's response headers are copied but before its body
    // is streamed, so we can still write the session cookie on this response.
    async onResponse(event, response) {
      const rotated = response.headers.get('x-pengu-token')
      // Only act on a genuinely new token for an existing session.
      if (!rotated || !secure?.apiToken || rotated === secure.apiToken) return

      // Refresh the client-readable claims from the new payload. defu (inside
      // setUserSession) merges these over the current session, so fields not in
      // the JWT — provider, minecraftUuid, loggedInAt — are preserved.
      let user: Partial<JwtPayload> | undefined
      try {
        const { id, name, avatar, donatorGroup } = jwtDecode<JwtPayload>(rotated)
        user = { id, name, avatar, donatorGroup }
      } catch {
        // Undecodable token: still adopt it so auth stays valid; leave user as-is.
      }

      await setUserSession(event, { ...(user ? { user } : {}), secure: { apiToken: rotated } })
    },
  })
})
