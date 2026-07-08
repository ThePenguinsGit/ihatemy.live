// Clears the sealed session cookie. Called from the header "Log out" action;
// the client then calls useUserSession().clear() to reset local state.
export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { ok: true }
})
