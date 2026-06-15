const STEPS = [
  {
    n: 1,
    title: "Sign in with Google",
    body: "No setup forms. Your private shop workspace is created automatically on first sign-in.",
  },
  {
    n: 2,
    title: "Add orders",
    body: "Enter the customer, phone, and number of loads — the amount due is calculated for you.",
  },
  {
    n: 3,
    title: "Text when done",
    body: "Tap Text Customer and Washify sends the SMS, so people know exactly when to pick up.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="bg-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2
          id="how-heading"
          className="text-3xl font-extrabold tracking-tight text-ink"
        >
          How it works
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="relative">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-lg font-extrabold text-white tabular-nums">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-base text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
