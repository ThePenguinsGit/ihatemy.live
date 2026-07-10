// No-op userinfo endpoint for the Microsoft provider (see auth/xbox.get.ts).
// nuxt-auth-utils unconditionally fetches a `userURL` after the token exchange,
// but an XboxLive.signin token can't hit any Microsoft userinfo endpoint, and
// the actual Minecraft-account resolution happens on PenguBot now (Mojang 403s
// Cloudflare Workers). This just has to return a non-error object; onSuccess
// ignores `user` and works from `tokens`.
export default defineEventHandler(() => ({ ok: true }))
