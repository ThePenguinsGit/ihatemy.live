export default defineEventHandler((event) => {
    return sendRedirect(event, useRuntimeConfig(event).public.discordUrl)
})