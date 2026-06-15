type LogoProps = {
  /** Hide the wordmark, show only the bubble mark. */
  markOnly?: boolean;
};

/** Aqua bubble/droplet mark + "Washify" wordmark. */
export default function Logo({ markOnly = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0"
        role="img"
        aria-label="Washify logo"
      >
        <circle cx="16" cy="16" r="15" fill="#06B6D4" />
        <circle cx="16" cy="16" r="15" fill="url(#bubbleShine)" />
        <circle cx="11" cy="11" r="3.5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="20" cy="19" r="2" fill="#FFFFFF" opacity="0.55" />
        <defs>
          <radialGradient id="bubbleShine" cx="0.3" cy="0.25" r="0.8">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      {!markOnly && (
        <span className="text-xl font-extrabold tracking-tight text-ink">
          Washify
        </span>
      )}
    </span>
  );
}
