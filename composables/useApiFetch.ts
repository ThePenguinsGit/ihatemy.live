// Thin useFetch wrapper for the PenguBot backend. Requests go through the local
// /api proxy (server/routes/api/[...].ts), which injects the auth token from the
// sealed session server-side — so callers never attach an Authorization header.
export const useApiFetch: typeof useFetch = (request, opts?) => {
    return useFetch(request, { ...(opts ?? {}), baseURL: '/api', server: false })
}
