import { useId, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { askFaq } from "../../lib/n8n";

type Message = { role: "user" | "bot"; text: string };

const GREETING: Message = {
  role: "bot",
  text: "Hi! Ask me about hours, pricing, services, or turnaround. 🫧",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  function scrollToEnd() {
    requestAnimationFrame(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    });
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const question = draft.trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setDraft("");
    setSending(true);
    scrollToEnd();

    try {
      const { answer } = await askFaq(question);
      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry — I couldn’t reach the assistant. Please try again, or contact the shop directly.",
        },
      ]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open FAQ chat"
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-card transition-transform hover:scale-105 motion-reduce:transform-none"
        >
          <MessageCircle size={26} aria-hidden="true" />
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="fixed bottom-5 right-5 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-card"
        >
          <header className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <h2 id={titleId} className="text-base font-bold">
              Ask Washify
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/15"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div
            ref={logRef}
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((m, i) => (
              <p
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-base text-white"
                    : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-bg px-3.5 py-2.5 text-base text-ink"
                }
              >
                {m.text}
              </p>
            ))}
            {sending && (
              <p className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-bg px-3.5 py-2.5 text-base text-muted">
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Thinking…
              </p>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-slate-200 p-3"
          >
            <label htmlFor="faq-input" className="sr-only">
              Your question
            </label>
            <input
              id="faq-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your question…"
              autoComplete="off"
              className="min-h-[44px] flex-1 rounded-xl bg-bg px-3 text-base text-ink placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={sending || draft.trim() === ""}
              aria-label="Send question"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
