import { useEffect, useId, useState } from "react";
import { X, Send, Loader2, MessageSquareText, Facebook, Sparkles } from "lucide-react";
import { sendSms, sendMessenger, draftMessage } from "../../lib/n8n";
import MessengerPanel from "./MessengerPanel";
import type { Order } from "./types";

type Channel = "sms" | "messenger";

type TextCustomerModalProps = {
  order: Order;
  pageId: string | null;
  /** Quantity unit for the AI draft (e.g. "loads" or "kg"). */
  unit: string;
  onClose: () => void;
  onSent: () => void;
  /** Persist a newly entered PSID back onto the order. */
  onSavePsid: (id: string, psid: string) => void;
};

const LIMITS: Record<Channel, number> = { sms: 160, messenger: 2000 };

export default function TextCustomerModal({
  order,
  pageId,
  unit,
  onClose,
  onSent,
  onSavePsid,
}: TextCustomerModalProps) {
  const [channel, setChannel] = useState<Channel>("sms");
  const [message, setMessage] = useState(
    `Hi ${order.customer_name}. Your laundry is done.`,
  );
  const [psid, setPsid] = useState(order.messenger_psid ?? "");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const limit = LIMITS[channel];

  async function handleDraft() {
    setDrafting(true);
    setError(null);
    try {
      const { message: drafted } = await draftMessage({
        customerName: order.customer_name,
        quantity: order.num_loads,
        unit,
        amount: Number(order.amount_due),
        paid: order.paid,
        channel,
        maxChars: limit,
      });
      if (drafted) setMessage(drafted.slice(0, limit));
    } catch {
      setError("Couldn't draft a message. Edit it manually or try again.");
    } finally {
      setDrafting(false);
    }
  }

  async function send() {
    setSending(true);
    setError(null);
    try {
      if (channel === "sms") {
        await sendSms(order.phone, message);
      } else {
        const id = psid.trim();
        if (!id) throw new Error("Enter the customer's Messenger PSID.");
        await sendMessenger(id, message);
        if (id !== order.messenger_psid) onSavePsid(order.id, id);
      }
      onSent();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the message.");
      setSending(false);
      setConfirming(false);
    }
  }

  function pickChannel(next: Channel) {
    setChannel(next);
    setConfirming(false);
    setError(null);
  }

  const tab = (c: Channel, label: string, Icon: typeof Send) => (
    <button
      type="button"
      onClick={() => pickChannel(c)}
      aria-pressed={channel === c}
      className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
        channel === c ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-bold text-ink">
            Notify {order.customer_name}
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

        <div className="mt-3 flex gap-1 rounded-xl bg-slate-100 p-1">
          {tab("sms", "SMS", MessageSquareText)}
          {tab("messenger", "Messenger", Facebook)}
        </div>

        {channel === "sms" ? (
          <p className="mt-3 text-sm tabular-nums text-muted">{order.phone}</p>
        ) : (
          <MessengerPanel
            order={order}
            pageId={pageId}
            psid={psid}
            onPsidChange={setPsid}
            inputId={`${titleId}-psid`}
          />
        )}

        <div className="mt-3 flex items-center justify-between">
          <label htmlFor={`${titleId}-msg`} className="text-sm font-semibold text-ink">
            Message
          </label>
          <button
            type="button"
            onClick={handleDraft}
            disabled={drafting}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-accent/20 px-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-accent/30 disabled:opacity-50"
          >
            {drafting ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles size={15} aria-hidden="true" />
            )}
            Draft with AI
          </button>
        </div>
        <textarea
          id={`${titleId}-msg`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={limit}
          rows={3}
          className="mt-3 w-full rounded-xl bg-bg p-3 text-base text-ink ring-1 ring-slate-200"
        />
        <p className="mt-1 text-right text-xs tabular-nums text-muted">
          {message.length}/{limit}
        </p>

        {error && (
          <p role="alert" className="mt-1 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-3 flex items-center justify-end gap-2">
          {confirming && (
            <span className="mr-auto text-sm text-muted">
              Send via {channel === "sms" ? "SMS" : "Messenger"}?
            </span>
          )}
          <button
            type="button"
            onClick={confirming ? () => setConfirming(false) : onClose}
            className="min-h-[44px] rounded-xl px-4 text-base font-semibold text-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirming ? send : () => setConfirming(true)}
            disabled={sending || message.trim() === ""}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <Send size={18} aria-hidden="true" />
            )}
            {confirming ? "Yes, send" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
