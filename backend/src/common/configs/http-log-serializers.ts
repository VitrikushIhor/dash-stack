import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { StdSerializedResults } from 'pino-http';

export function createHttpRequestId(request: Pick<IncomingMessage, 'headers'>): string {
  const candidate = request.headers['x-request-id'];
  if (
    typeof candidate === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
  ) {
    return candidate;
  }
  return randomUUID();
}

export function serializeHttpRequest(request: StdSerializedResults['req']) {
  return {
    id: request.id,
    method: request.method,
    path: request.url.split('?', 1)[0],
  };
}

export function serializeHttpResponse(response: StdSerializedResults['res']) {
  return { statusCode: response.statusCode };
}
