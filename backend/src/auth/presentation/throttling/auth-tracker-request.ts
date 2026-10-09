export function peerTracker(request: Record<string, unknown>): string {
  const socket: unknown = request.socket;
  const remoteAddress =
    typeof socket === 'object' &&
    socket !== null &&
    'remoteAddress' in socket &&
    typeof socket.remoteAddress === 'string'
      ? socket.remoteAddress
      : 'unknown';

  return `peer:${remoteAddress}`;
}
