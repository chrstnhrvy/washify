type Datum = { label: string; value: number };

type BarChartProps = {
  data: Datum[];
  /** Tailwind background class for the bars. */
  colorClass?: string;
  format?: (value: number) => string;
  ariaLabel: string;
};

/** Lightweight responsive bar chart (CSS bars, no chart library). */
export default function BarChart({
  data,
  colorClass = "bg-primary",
  format = (n) => String(n),
  ariaLabel,
}: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const showLabels = data.length <= 10;

  return (
    <figure role="img" aria-label={ariaLabel}>
      <div className="flex h-40 items-end gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col justify-end" title={`${d.label}: ${format(d.value)}`}>
            <div
              className={`w-full rounded-t ${colorClass}`}
              style={{
                height: `${(d.value / max) * 100}%`,
                minHeight: d.value > 0 ? 4 : 0,
              }}
            />
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="mt-2 flex gap-1.5">
          {data.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[10px] tabular-nums text-muted">
              {d.label}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}
