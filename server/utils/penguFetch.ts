import { buildCanonicalString, hmacSha256Base64, sha256Hex } from './penguSignature'

// Signed server-to-server request to the PenguBot backend.
//
// Only the website's server holds the shared signing key (NUXT_PENGU_SIGNING_KEY),
// so a valid signature proves a request came from THIS server and not from a user
// hitting PenguBot directly. Anything the browser can send, a user can forge — so
// trust lives entirely in this HMAC, computed here and never client-side.
//
// The canonical string + HMAC live in penguSignature.ts, which PenguBot uses to
// verify. See that file for the format and the required verification steps.

export interface PenguFetchOptions {
  /** HTTP method for the signed request. Defaults to POST. */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}

/**
 * POST (by default) `body` to `path` on the PenguBot backend, signed so the
 * backend can authenticate it as coming from this server. `path` must start with
 * a slash and is part of the signature, so it must be exactly what PenguBot sees.
 */
export async function penguFetch<T>(path: string, body: unknown, opts: PenguFetchOptions = {}): Promise<T> {
  const config = useRuntimeConfig()
  const secret = config.pengu.signingKey
  if (!secret) {
    throw new Error('PenguBot signing key is not configured (NUXT_PENGU_SIGNING_KEY)')
  }

  const method = opts.method ?? 'POST'
  // Sign over the exact string we send, so the backend hashes identical bytes.
  const raw = JSON.stringify(body ?? {})
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomUUID()
  const bodyHash = await sha256Hex(raw)

  const canonical = buildCanonicalString({ method, path, timestamp, nonce, bodyHash })
  const signature = await hmacSha256Base64(secret, canonical)

  return await $fetch<T>(`${config.public.apiBaseUrl}${path}`, {
    method,
    body: raw,
    headers: {
      'content-type': 'application/json',
      'x-pengu-key-id': config.pengu.signingKeyId,
      'x-pengu-timestamp': timestamp,
      'x-pengu-nonce': nonce,
      'x-pengu-signature': signature,
    },
  })
}

/**
 * Whether the PenguBot integration is configured with a real signing key. When
 * false (e.g. local dev with the dummy placeholder), callers fall back to stub
 * data instead of issuing live signed requests.
 */
export function isPenguBackendConfigured(): boolean {
  const key = useRuntimeConfig().pengu.signingKey
  return !!key && !key.startsWith('dummy')
}
