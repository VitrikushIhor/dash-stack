export const SESSION_ACTIVITY_INTERVAL_MS = 5 * 60 * 1000;

export function isSessionActivityDue(lastUsedAt: Date, now: Date): boolean {
  return now.getTime() - lastUsedAt.getTime() >= SESSION_ACTIVITY_INTERVAL_MS;
}
