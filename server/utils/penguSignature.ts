// Shared HMAC request-signing primitives + verifier for website ⇄ PenguBot.
//
// This file is self-contained (only Web Crypto / standard globals — crypto.subtle,
// TextEncoder, atob/btoa) so it can be dropped into the PenguBot backend as-is to
// verify what penguFetch.ts signs. The website's signing side (penguFetch.ts) also
// imports the primitives here, so there is a SINGLE canonical definition and the
// two sides can't drift.
//
//   canonical =
//     METHOD                 \n   (upper-case, e.g. POST)
//     PATH                   \n   (request pathname incl. leading slash; no host/query)
//     TIMESTAMP              \n   (unix seconds, as sent in x-pengu-timestamp)
//     NONCE                  \n   (as sent in x-pengu-nonce)
//     SHA256_HEX(rawBody)         (lower-case hex of the exact bytes sent as body)
//
//   signature = base64( HMAC-SHA256(signingKey, canonical) )

export const PENGU_MAX_SKEW_SECONDS = 300

export interface CanonicalParts {
  method: string
  path: string
  timestamp: string
  nonce: string
  bodyHash: string
}

export function buildCanonicalString(parts: CanonicalParts): string {
  return [parts.method.toUpperCase(), parts.path, parts.timestamp, parts.nonce, parts.bodyHash].join('\n')
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hmacSha256Base64(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return bytesToBase64(new Uint8Array(signature))
}

// ── verification ─────────────────────────────────────────────────────────────

/** Header lookup accepting a Fetch `Headers`, a plain record, or a getter fn. */
export type HeadersInput =
  | Headers
  | Record<string, string | string[] | undefined>
  | ((name: string) => string | null | undefined)

export interface SignedRequest {
  method: string
  /** Request pathname only — no query string (it is not part of the signature). */
  path: string
  /** The exact raw request body bytes, as a string. */
  rawBody: string
  headers: HeadersInput
}

export interface VerifyOptions {
  /** Resolve the shared secret for a key id (return undefined for unknown ids). */
  getSecret: (keyId: string) => string | undefined | Promise<string | undefined>
  /**
   * Record the nonce and report whether it was unseen (fresh). Called only after
   * the signature is valid, so forged requests can't poison the store. Persist
   * with a TTL >= the skew window. Omit to skip replay protection (not advised).
   */
  consumeNonce?: (nonce: string, ttlSeconds: number) => boolean | Promise<boolean>
  /** Max allowed clock skew, seconds. Defaults to PENGU_MAX_SKEW_SECONDS. */
  maxSkewSeconds?: number
  /** Override the clock (seconds). For tests. */
  now?: () => number
}

export type VerifyFailureReason =
  | 'missing_headers'
  | 'unknown_key'
  | 'timestamp_skew'
  | 'bad_signature'
  | 'replay'
  | 'bad_body'

export type VerifyResult<T> =
  | { ok: true, body: T, keyId: string, timestamp: number }
  | { ok: false, reason: VerifyFailureReason }

/**
 * Verify a signed PenguBot request and parse its JSON body. On success the body
 * is authenticated — trust any `actor`/identity it asserts. Example:
 *
 *   const result = await verifyPenguSignature<MyBody>(
 *     { method: req.method, path: url.pathname, rawBody, headers: req.headers },
 *     { getSecret: id => SECRETS[id], consumeNonce: (n, ttl) => cache.add(n, ttl) },
 *   )
 *   if (!result.ok) return reject(result.reason)
 *   use(result.body)
 */
export async function verifyPenguSignature<T = unknown>(
  req: SignedRequest,
  opts: VerifyOptions,
): Promise<VerifyResult<T>> {
  const keyId = readHeader(req.headers, 'x-pengu-key-id')
  const timestamp = readHeader(req.headers, 'x-pengu-timestamp')
  const nonce = readHeader(req.headers, 'x-pengu-nonce')
  const signature = readHeader(req.headers, 'x-pengu-signature')
  if (!keyId || !timestamp || !nonce || !signature) {
    return { ok: false, reason: 'missing_headers' }
  }

  const secret = await opts.getSecret(keyId)
  if (!secret) return { ok: false, reason: 'unknown_key' }

  const maxSkew = opts.maxSkewSeconds ?? PENGU_MAX_SKEW_SECONDS
  const now = opts.now ? opts.now() : Math.floor(Date.now() / 1000)
  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(now - ts) > maxSkew) {
    return { ok: false, reason: 'timestamp_skew' }
  }

  const bodyHash = await sha256Hex(req.rawBody)
  const canonical = buildCanonicalString({ method: req.method, path: req.path, timestamp, nonce, bodyHash })
  const expected = await hmacSha256Base64(secret, canonical)
  if (!timingSafeEqualBase64(expected, signature)) {
    return { ok: false, reason: 'bad_signature' }
  }

  // Signature is valid → safe to record the nonce for replay detection.
  if (opts.consumeNonce) {
    const fresh = await opts.consumeNonce(nonce, maxSkew)
    if (!fresh) return { ok: false, reason: 'replay' }
  }

  let body: T
  try {
    body = req.rawBody ? JSON.parse(req.rawBody) as T : ({} as T)
  }
  catch {
    return { ok: false, reason: 'bad_body' }
  }

  return { ok: true, body, keyId, timestamp: ts }
}

// ── internals ────────────────────────────────────────────────────────────────

function readHeader(headers: HeadersInput, name: string): string | undefined {
  if (typeof headers === 'function') return headers(name) ?? undefined
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name) ?? undefined
  }
  const record = headers as Record<string, string | string[] | undefined>
  const value = record[name] ?? record[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

/** Constant-time compare of two base64 signatures. */
function timingSafeEqualBase64(a: string, b: string): boolean {
  let ba: Uint8Array, bb: Uint8Array
  try {
    ba = base64ToBytes(a)
    bb = base64ToBytes(b)
  }
  catch {
    return false
  }
  if (ba.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i]
  return diff === 0
}
