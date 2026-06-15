import { Plus } from "lucide-react";
import Reveal from "../../components/ui/Reveal";

const QA = [
  {
    q: "How much does Washify cost?",
    a: "Nothing to try. Washify runs entirely on free tiers and is built as a portfolio project, not a paid product.",
  },
  {
    q: "Can more than one shop use it?",
    a: "Yes. Every owner signs in with their own Google account and gets a private workspace. One shop can never see another shop’s orders or customers.",
  },
  {
    q: "Is customer data kept private?",
    a: "Yes. Data is isolated per shop at the database level with Row Level Security, so the separation never depends on the app behaving correctly.",
  },
  {
    q: "Do customers need an app to get texts?",
    a: "No. Washify sends a normal SMS, so it lands on any phone. There’s no app to install and no chat to opt into first.",
  },
  {
    q: "What can the FAQ assistant answer?",
    a: "Only what’s in that shop’s FAQ, such as hours, pricing, services, and turnaround. It won’t guess, and it can’t read order data.",
  },
];

export default function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto max-w-3xl px-4 py-16 sm:px-6"
    >
      <h2
        id="faq-heading"
        className="text-3xl font-extrabold tracking-tight text-ink"
      >
        Questions, answered
      </h2>
      <div className="mt-8 space-y-3">
        {QA.map(({ q, a }, i) => (
          <Reveal key={q} delay={i * 60}>
            <details className="group rounded-2xl border border-slate-200 bg-surface px-5 shadow-card">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {q}
                <Plus
                  size={20}
                  className="shrink-0 text-primary transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 text-base text-muted">{a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
