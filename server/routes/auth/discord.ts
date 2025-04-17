export default defineEventHandler((event) => {
    const requestUrl = getRequestURL(event)
    const url = `${requestUrl.protocol}//${requestUrl.host}/auth/discord/callback`
    const clientId = useRuntimeConfig(event).discordClientId
    return sendRedirect(event, `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(url)}&scope=identify`)
})