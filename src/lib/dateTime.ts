const staleThresholdMs = 2 * 60 * 60 * 1000;

export function formatObservationTime(observedAt: string | null): string | null {
  if (observedAt === null || Number.isNaN(Date.parse(observedAt))) {
    return null;
  }

  const time = observedAt.match(/T(\d{2}):(\d{2})/);
  return time ? `${time[1]}:${time[2]}` : null;
}

export function isObservationStale(observedAt: string | null, now = new Date()): boolean {
  if (observedAt === null) {
    return false;
  }

  const observedTime = Date.parse(observedAt);

  if (Number.isNaN(observedTime)) {
    return false;
  }

  return now.getTime() - observedTime > staleThresholdMs;
}
