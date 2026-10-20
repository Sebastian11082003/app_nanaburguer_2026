/**
 * Metric tile used by dashboard and reports so the two screens cannot
 * drift in spacing/type. Value is already formatted by the caller.
 */
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      {hint ? <p className="mt-1 text-sm text-zinc-500">{hint}</p> : null}
    </div>
  );
}
