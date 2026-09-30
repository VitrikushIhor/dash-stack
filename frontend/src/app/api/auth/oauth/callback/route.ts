import type { NextRequest, NextResponse } from 'next/server'
import { handleOAuthCallback } from '@/shared/api/oauth'

export function GET(request: NextRequest): Promise<NextResponse> {
  return handleOAuthCallback(request)
}
