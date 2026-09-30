import { NextResponse } from 'next/server'
import type { ProxyError } from '../proxy.types'

export function proxyErrorResponse(
  error: ProxyError,
  headers?: HeadersInit
): NextResponse {
  const { status, code, message } = error
  return NextResponse.json({ code, message }, { status, headers })
}
