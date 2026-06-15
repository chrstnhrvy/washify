/**
 * Dispatch this event on `window` to open the FAQ chat widget from anywhere:
 *   window.dispatchEvent(new Event(OPEN_CHAT_EVENT))
 * Kept in its own module so callers don't statically import the lazy widget.
 */
export const OPEN_CHAT_EVENT = "washify:open-chat";
