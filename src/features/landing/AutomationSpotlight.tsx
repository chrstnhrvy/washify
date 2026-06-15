import { Send, Zap, Smartphone, type LucideIcon } from "lucide-react";
import Reveal from "../../components/ui/Reveal";

type Step = { icon: LucideIcon; title: string; body: string };

const FLOW: Step[] = [
  {
    icon: Send,
    title: "Tap “Text Customer”",
    body: "Pick the order that’s ready and confirm the pre-filled message.",
  },
  {
    icon: Zap,
    title: "Washify formats and sends",
    body: "An n8n workflow tidies the number into Philippine format and fires off a single SMS.",
  },
  {
    icon: Smartphone,
    title: "Customer gets the text",
    body: "A real SMS lands on any phone in seconds. No app, no chat opt-in.",
  },
];

export default function AutomationSpotlight() {
  return (
    <section
      aria-labelledby="automation-heading"
      className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2"
    >
      <Reveal>
        <span className="text-sm font-semibold uppercase tracking-wide text-primary-dark">
          The showpiece
        </span>
        <h2
          id="automation-heading"
          className="mt-2 text-3xl font-extrabold tracking-tight text-ink"
        >
          One tap, and your customer knows
        </h2>
        <p className="mt-4 text-lg text-muted">
          Pickup reminders are the chore every shop forgets. Washify turns it
          into a single tap. The moment an order is ready, your customer gets a
          friendly SMS, sent through a real automation you can see and adjust.
        </p>
        <p className="mt-4 text-base text-muted">
          The gateway is free and built for the Philippines, so there’s no
          per-text cost and numbers typed as 0917… simply work.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <ol className="space-y-3">
          {FLOW.map(({ icon: Icon, title, body }, i) => (
            <li
              key={title}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-surface p-5 shadow-card"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-ink">
                  {i + 1}. {title}
                </p>
                <p className="mt-1 text-base text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
