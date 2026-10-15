/**
 * KDS default window (HU-031): local calendar day, not a multi-day backlog.
 * Colombia POS — America/Bogota has no DST (UTC−5).
 */
const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

export function startOfKitchenDay(now = new Date()): Date {
  const shifted = new Date(now.getTime() - BOGOTA_OFFSET_MS);
  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
      5,
      0,
      0,
      0,
    ),
  );
}
