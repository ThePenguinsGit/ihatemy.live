export const useApiFetch: typeof useFetch = (request, opts?) => {
    const config = useRuntimeConfig()

    if (opts !== undefined) {
        opts.baseURL = config.public.apiBaseUrl
    } else {
        opts = { baseURL: config.public.apiBaseUrl }
    }

    return useFetch(config.public.apiBaseUrl + request, {...opts, baseURL: config.public.apiBaseUrl, server: false})
}