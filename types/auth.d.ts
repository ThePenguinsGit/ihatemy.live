// Session shape for nuxt-auth-utils (see server/routes/auth/*).
//
// `User` is client-readable via useUserSession().user — only the decoded,
// non-sensitive JWT claims live here. The raw PenguBot JWT that authorizes
// backend calls is kept in `SecureSessionData` (server-only, never shipped to
// the browser); server/routes/api/[...].ts injects it as the Authorization
// header when proxying to PenguBot.
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    avatar: string
    donatorGroup: string | null
    provider: 'discord' | 'xbox'
    // Set once a Minecraft account is linked (always via Xbox login).
    minecraftUuid?: string | null
  }

  interface UserSession {
    loggedInAt: number
  }

  interface SecureSessionData {
    // PenguBot-minted JWT — sent as the raw `Authorization` value to the backend.
    apiToken: string
  }
}

export {}
