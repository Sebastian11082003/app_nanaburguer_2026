/**
 * Inclusive UTC calendar days from `YYYY-MM-DD` query params.
 * The API host is UTC; a Colombia-local day picker is out of this increment.
 */
export type DateRange = {
  start?: Date;
  end?: Date;
};

export function parseDayRange(from?: string, to?: string): DateRange {
  const range: DateRange = {};
  if (from) {
    range.start = new Date(`${from.slice(0, 10)}T00:00:00.000Z`);
  }
  if (to) {
    range.end = new Date(`${to.slice(0, 10)}T23:59:59.999Z`);
  }
  return range;
}

export function createdAtFilter(range: DateRange) {
  if (!range.start && !range.end) return undefined;
  return {
    ...(range.start ? { gte: range.start } : {}),
    ...(range.end ? { lte: range.end } : {}),
  };
}
