import type { NextRequest, NextResponse } from 'next/server'
import { startOAuthAccountLink, startOAuthLogin } from '@/shared/api/oauth'

export function GET(request: NextRequest): NextResponse {
  return startOAuthLogin(request)
}

export function POST(request: NextRequest): Promise<NextResponse> {
  return startOAuthAccountLink(request)
}
