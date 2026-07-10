// Keep the reactive user session in sync when the backend rotates the JWT.
//
// When a proxied /api call changes data that lives inside the PenguBot JWT
// (display name, avatar, donator group, …), the backend re-mints the token. The
// /api proxy (server/routes/api/[...].ts) adopts it into the sealed session and
// tags the response with `x-pengu-session-refreshed` (the raw token itself is
// stripped server-side and never reaches the browser). The in-memory session
// that useUserSession() exposes is stale at that point, so anything bound to
// user.* — header avatar/name, account page, etc. — wouldn't re-render.
//
// Re-pull the session on that signal so the reactive state updates. Wrapping the
// global $fetch (rather than only useApiFetch) covers every call style the app
// uses: useFetch, useApiFetch and raw $fetch('/api/...') mutations.
export default defineNuxtPlugin(() => {
  const { fetch: refreshSession, loggedIn } = useUserSession()

  globalThis.$fetch = $fetch.create({
    onResponse({ response }) {
      if (loggedIn.value && response.headers.has('x-pengu-session-refreshed')) {
        // Fire-and-forget: re-reads /api/_auth/session and updates the reactive
        // session state. The session endpoint isn't proxied, so this won't loop.
        refreshSession()
      }
    },
  })
})
