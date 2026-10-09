import type { NextRequest } from 'next/server'
import { HTTP_METHODS } from '@/shared/api/http-methods'
import { env } from '@/shared/config/env'
import { SAFE_PROXY_METHODS } from './proxy-method-groups'

const MIB = 1024 * 1024
const MAX_PATH_DECODE_DEPTH = 4
const LOCAL_HOSTS: ReadonlySet<string> = new Set(['localhost', '127.0.0.1'])
const BODY_LIMITS = {
  DEFAULT: 5 * MIB,
  FORM: MIB,
  FILE_UPLOAD: 51 * MIB, // 50 MiB file plus multipart overhead
  IMAGE_UPLOAD: 11 * MIB, // 10 MiB image plus multipart overhead
} as const

function trustedAppOrigin(requestOrigin: string): string | null {
  const configuredUrl = env.NEXT_PUBLIC_APP_URL ?? env.FRONTEND_URL
  if (!configuredUrl)
    return env.NODE_ENV === 'production' ? null : requestOrigin

  try {
    const url = new URL(configuredUrl)
    return url.origin === configuredUrl ? url.origin : null
  } catch {
    return null
  }
}

function isAllowedLocalOrigin(origin: URL, trustedOrigin: URL): boolean {
  return (
    env.NODE_ENV !== 'production' &&
    origin.protocol === 'http:' &&
    trustedOrigin.protocol === 'http:' &&
    LOCAL_HOSTS.has(origin.hostname) &&
    LOCAL_HOSTS.has(trustedOrigin.hostname) &&
    origin.port === trustedOrigin.port
  )
}

export function normalizePath(path: string[]): string[] | null {
  const normalized: string[] = []

  for (const segment of path) {
    let decoded = segment

    for (
      let depth = 0;
      depth < MAX_PATH_DECODE_DEPTH && decoded.includes('%');
      depth += 1
    ) {
      try {
        decoded = decodeURIComponent(decoded)
      } catch {
        return null
      }
    }

    if (
      decoded.length === 0 ||
      decoded === '.' ||
      decoded === '..' ||
      decoded.includes('%') ||
      /[\\/?#]/u.test(decoded) ||
      [...decoded].some((character) => {
        const codePoint = character.codePointAt(0)
        return codePoint !== undefined && (codePoint < 32 || codePoint === 127)
      })
    ) {
      return null
    }

    normalized.push(decoded)
  }

  return normalized
}

export function isTrustedMutation(req: NextRequest): boolean {
  if (SAFE_PROXY_METHODS.includes(req.method)) return true

  const trustedOrigin = trustedAppOrigin(req.nextUrl.origin)
  if (!trustedOrigin) return false

  const origin = req.headers.get('origin')
  const fetchSite = req.headers.get('sec-fetch-site')

  if (origin !== null) {
    try {
      const parsedOrigin = new URL(origin)
      if (
        parsedOrigin.origin !== trustedOrigin &&
        !isAllowedLocalOrigin(parsedOrigin, new URL(trustedOrigin))
      )
        return false
    } catch {
      return false
    }
  }
  if (fetchSite !== null && fetchSite !== 'same-origin') return false
  if (
    req.headers.has('cookie') &&
    origin === null &&
    fetchSite !== 'same-origin'
  ) {
    return false
  }

  return true
}

export function maxRequestBodyBytes(
  path: string[],
  method: string,
  contentType: string | null
): number {
  const normalizedContentType = contentType?.toLowerCase()
  const multipartUpload =
    method === HTTP_METHODS.POST &&
    path.length === 2 &&
    path[0] === 'storage' &&
    normalizedContentType?.startsWith('multipart/form-data;')

  if (multipartUpload && path[1] === 'file') return BODY_LIMITS.FILE_UPLOAD
  if (multipartUpload && path[1] === 'image') return BODY_LIMITS.IMAGE_UPLOAD
  if (normalizedContentType?.startsWith('application/x-www-form-urlencoded'))
    return BODY_LIMITS.FORM
  return BODY_LIMITS.DEFAULT
}

export async function readBoundedBody(
  req: NextRequest,
  maxBytes: number
): Promise<ArrayBuffer | null> {
  const declaredLength = req.headers.get('content-length')

  if (declaredLength !== null) {
    const length = Number(declaredLength)
    if (
      !/^\d+$/u.test(declaredLength) ||
      !Number.isSafeInteger(length) ||
      length > maxBytes
    )
      return null
  }
  if (!req.body) return new ArrayBuffer(0)

  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel()
        return null
      }

      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const result = new Uint8Array(total)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }

  return result.buffer
}
