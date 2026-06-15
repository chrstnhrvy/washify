import {
  ClipboardList,
  MessageSquareText,
  LineChart,
  Bot,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "../../hooks/useInView";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: ClipboardList,
    title: "Order tracking",
    body: "Log drop-offs in seconds and move each order through Received → Washing → Ready → Picked up.",
  },
  {
    icon: MessageSquareText,
    title: "Customer SMS",
    body: "One tap texts the customer the moment their laundry is done, sent automatically through an n8n workflow.",
  },
  {
    icon: LineChart,
    title: "Sales & Excel export",
    body: "See revenue by day, week, or month, then download any period as an .xlsx with one click.",
  },
  {
    icon: Bot,
    title: "FAQ chatbot",
    body: "A public AI assistant answers hours, pricing, and turnaround, grounded only in your shop’s FAQ.",
  },
];

export default function Features() {
  const { ref, inView } = useInView<HTMLUListElement>();

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <div className="max-w-2xl">
        <h2
          id="features-heading"
          className="text-3xl font-extrabold tracking-tight text-ink"
        >
          Everything a busy shop needs
        </h2>
        <p className="mt-3 text-lg text-muted">
          Built around the day-to-day of running a laundromat. Fast to use, and
          friendly for your customers.
        </p>
      </div>
      <ul
        ref={ref}
        className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {FEATURES.map(({ icon: Icon, title, body }, i) => (
          <li
            key={title}
            className={`reveal ${inView ? "reveal-in" : ""} rounded-2xl border border-slate-200 bg-surface p-6 shadow-card hover:-translate-y-1 motion-reduce:transform-none`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary-dark">
              <Icon size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
            <p className="mt-2 text-base text-muted">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
