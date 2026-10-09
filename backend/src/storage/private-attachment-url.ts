export function privateAttachmentUrl(key: string): string {
  return `/api/proxy/storage/attachments/${Buffer.from(key).toString('base64url')}`;
}
