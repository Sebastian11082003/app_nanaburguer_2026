"use client";

import {
  defaultReportRange,
  lastDaysRange,
  ReportRange,
  thisMonthRange,
} from "@/src/lib/report-range";

/**
 * Shared from/to + presets so every report page cannot invent its own
 * date math. Values are YYYY-MM-DD (UTC days, matching the API).
 */
export function ReportRangeBar({
  value,
  onChange,
}: {
  value: ReportRange;
  onChange: (next: ReportRange) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="space-y-1 text-sm">
        <span className="text-zinc-500">Desde</span>
        <input
          type="date"
          value={value.from}
          onChange={(event) =>
            onChange({ ...value, from: event.target.value })
          }
          className="block rounded-xl border border-zinc-700 bg-black px-3 py-2"
        />
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-zinc-500">Hasta</span>
        <input
          type="date"
          value={value.to}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
          className="block rounded-xl border border-zinc-700 bg-black px-3 py-2"
        />
      </label>
      <button
        type="button"
        onClick={() => onChange(lastDaysRange(7))}
        className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900"
      >
        7 días
      </button>
      <button
        type="button"
        onClick={() => onChange(defaultReportRange())}
        className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900"
      >
        30 días
      </button>
      <button
        type="button"
        onClick={() => onChange(thisMonthRange())}
        className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900"
      >
        Este mes
      </button>
    </div>
  );
}
