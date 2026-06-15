import { ORDER_STATUSES, STATUS_STYLES, type OrderStatus } from "./types";

type StatusControlProps = {
  value: OrderStatus;
  onChange: (next: OrderStatus) => void;
  id: string;
};

/** A status badge that doubles as a picker (native select, color-coded). */
export default function StatusControl({ value, onChange, id }: StatusControlProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        Order status
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as OrderStatus)}
        className={`min-h-[44px] cursor-pointer rounded-xl px-3 text-sm font-bold ${STATUS_STYLES[value]}`}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
