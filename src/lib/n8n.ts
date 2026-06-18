// Typed client for the two live Washify n8n webhooks.
//   POST /laundry-done  { phone, message }  -> { status: "sent" }
//   POST /faq-chat      { question }        -> { answer: string }
// Base URL is configured via VITE_N8N_BASE_URL (see .env.example).

const BASE_URL = (
  import.meta.env.VITE_N8N_BASE_URL ?? "http://localhost:5678/webhook"
).replace(/\/$/, "");

async function postWebhook<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`n8n "${path}" responded ${res.status}`);
  }
  // Some workflows respond with an empty body; don't crash on JSON.parse("").
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`n8n "${path}" returned a non-JSON response`);
  }
}

/**
 * Send the "your laundry is done" SMS via the n8n SMS API PH workflow.
 * `phone` may be typed as 09XX / 63XX / +63XX — n8n normalizes to E.164.
 * `message` should already have {Customer Name} substituted and be <=160 chars.
 */
export function sendSms(phone: string, message: string) {
  return postWebhook<{ status: string }>("laundry-done", { phone, message });
}

/**
 * Notify a customer via the shop's Facebook Page (Messenger).
 * `psid` is the customer's Page-Scoped ID, captured when they message the Page.
 * Only delivers within Messenger's 24-hour window; `message` may be up to 2000 chars.
 */
export function sendMessenger(psid: string, message: string) {
  return postWebhook<{ status: string }>("messenger-send", { psid, message });
}

/** Ask the per-shop RAG FAQ chatbot a question. */
export function askFaq(question: string) {
  return postWebhook<{ answer: string }>("faq-chat", { question });
}

export type DraftInput = {
  customerName: string;
  quantity: number;
  unit: string;
  amount: number;
  paid: boolean;
  channel: "sms" | "messenger";
  maxChars: number;
};

/** Ask Groq (via n8n) to draft a friendly "laundry is ready" message. */
export function draftMessage(input: DraftInput) {
  return postWebhook<{ message: string }>("draft-message", input);
}
