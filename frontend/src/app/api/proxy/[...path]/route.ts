import type { NextRequest } from 'next/server'
import { type ProxyRouteContext, forwardProxyRequest } from '@/shared/api/proxy'

async function handle(req: NextRequest, { params }: ProxyRouteContext) {
  const { path = [] } = await params
  return forwardProxyRequest(req, path)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const HEAD = handle
