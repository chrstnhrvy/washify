import { Loader2 } from "lucide-react";

type SpinnerProps = {
  label?: string;
  /** Fill the viewport (use for full-page loading states). */
  fullPage?: boolean;
};

export default function Spinner({ label = "Loading…", fullPage }: SpinnerProps) {
  return (
    <div
      className={
        fullPage ? "grid min-h-dvh place-items-center bg-bg" : "grid place-items-center py-12"
      }
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-2 text-muted">
        <Loader2 className="animate-spin" size={20} aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}
