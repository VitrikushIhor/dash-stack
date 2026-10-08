import type { NextRequest, NextResponse } from 'next/server'
import { handleOAuthCallbackFacade } from '@/shared/api/oauth'

export function GET(request: NextRequest): Promise<NextResponse> {
  return handleOAuthCallbackFacade(request)
}
