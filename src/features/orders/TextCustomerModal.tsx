import { useEffect, useId, useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { sendSms } from "../../lib/n8n";
import type { Order } from "./types";

const LIMIT = 160;

type TextCustomerModalProps = {
  order: Order;
  onClose: () => void;
  onSent: () => void;
};

export default function TextCustomerModal({ order, onClose, onSent }: TextCustomerModalProps) {
  const [message, setMessage] = useState(
    `Hi ${order.customer_name}. Your laundry is done.`,
  );
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send() {
    setSending(true);
    setError(null);
    try {
      await sendSms(order.phone, message);
      onSent();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the message.");
      setSending(false);
      setConfirming(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-bold text-ink">
            Text {order.customer_name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-slate-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 text-sm tabular-nums text-muted">{order.phone}</p>

        <label htmlFor={`${titleId}-msg`} className="sr-only">
          Message
        </label>
        <textarea
          id={`${titleId}-msg`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={LIMIT}
          rows={3}
          className="mt-3 w-full rounded-xl bg-bg p-3 text-base text-ink ring-1 ring-slate-200"
        />
        <p className="mt-1 text-right text-xs tabular-nums text-muted">
          {message.length}/{LIMIT}
        </p>

        {error && (
          <p role="alert" className="mt-1 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {confirming ? (
          <div className="mt-3 flex items-center justify-end gap-2">
            <span className="mr-auto text-sm text-muted">Send this SMS?</span>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="min-h-[44px] rounded-xl px-4 text-base font-semibold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              ) : (
                <Send size={18} aria-hidden="true" />
              )}
              Yes, send
            </button>
          </div>
        ) : (
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl px-4 text-base font-semibold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={message.trim() === ""}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              <Send size={18} aria-hidden="true" />
              Send SMS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
