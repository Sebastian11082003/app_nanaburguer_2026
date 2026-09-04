export type ReportRange = { from: string; to: string };

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Default window: last 30 UTC days, inclusive. */
export function defaultReportRange(): ReportRange {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 29);
  return { from: isoDay(from), to: isoDay(to) };
}

export function lastDaysRange(days: number): ReportRange {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return { from: isoDay(from), to: isoDay(to) };
}

export function thisMonthRange(): ReportRange {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { from: isoDay(from), to: isoDay(now) };
}
