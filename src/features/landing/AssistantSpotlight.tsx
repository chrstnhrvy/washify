import { Sparkles } from "lucide-react";
import Reveal from "../../components/ui/Reveal";
import { OPEN_CHAT_EVENT } from "../faq-chat/events";

function openChat() {
  window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
}

export default function AssistantSpotlight() {
  return (
    <section aria-labelledby="assistant-heading" className="bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <div className="rounded-2xl border border-slate-200 bg-bg p-5 shadow-card">
            <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-base text-white">
              What time do you close on Saturdays?
            </p>
            <p className="mt-3 mr-auto max-w-[88%] rounded-2xl rounded-bl-sm bg-surface px-4 py-2.5 text-base text-ink ring-1 ring-slate-100">
              We’re open until 7:00 PM on Saturdays. Same-day service is
              available if you drop off before 10:00 AM.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="order-1 lg:order-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-dark">
            <Sparkles size={16} aria-hidden="true" />
            AI assistant
          </span>
          <h2
            id="assistant-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight text-ink"
          >
            Answers for customers, any hour
          </h2>
          <p className="mt-4 text-lg text-muted">
            A public chat assistant handles the questions you answer ten times a
            day: hours, pricing, services, turnaround. It only ever uses your
            shop’s own FAQ, so it never invents a policy or a price.
          </p>
          <p className="mt-4 text-base text-muted">
            It can reply in English or Tagalog, and it never touches private
            order data.
          </p>
          <button
            type="button"
            onClick={openChat}
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Try the assistant
          </button>
        </Reveal>
      </div>
    </section>
  );
}
