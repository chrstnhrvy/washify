import { QRCodeSVG } from "qrcode.react";
import type { Order } from "./types";

type MessengerPanelProps = {
  order: Order;
  pageId: string | null;
  psid: string;
  onPsidChange: (value: string) => void;
  inputId: string;
};

/**
 * Messenger tab content: a QR that opens a chat with the shop's Page, plus the
 * order code to send. When the customer messages that code, the inbound n8n
 * workflow saves their PSID onto this order automatically.
 */
export default function MessengerPanel({
  order,
  pageId,
  psid,
  onPsidChange,
  inputId,
}: MessengerPanelProps) {
  const mmeUrl = pageId ? `https://m.me/${pageId}` : null;

  return (
    <div className="mt-3 space-y-3">
      {mmeUrl ? (
        <div className="flex items-center gap-4 rounded-xl bg-bg p-3 ring-1 ring-slate-200">
          <div className="rounded-lg bg-white p-2">
            <QRCodeSVG value={mmeUrl} size={96} aria-label="Messenger chat QR" />
          </div>
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-ink">Link Messenger</p>
            <p className="text-muted">
              Customer scans to open a chat, then sends this code:
            </p>
            <p className="mt-1 text-lg font-extrabold tracking-wide text-primary-dark">
              {order.order_code ?? "—"}
            </p>
            <p className="text-muted">Their Messenger ID then links to this order.</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Add your Facebook Page ID in Settings to show a connect QR here.
        </p>
      )}

      <div>
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">
          Messenger PSID
        </label>
        <input
          id={inputId}
          value={psid}
          onChange={(e) => onPsidChange(e.target.value)}
          placeholder="Auto-fills after the customer sends the code"
          className="mt-1 min-h-[44px] w-full rounded-xl bg-bg px-3 text-base tabular-nums text-ink ring-1 ring-slate-200 placeholder:text-muted"
        />
        <p className="mt-1 text-xs text-muted">
          Only delivers within 24h of the customer's last message to your Page.
        </p>
      </div>
    </div>
  );
}
