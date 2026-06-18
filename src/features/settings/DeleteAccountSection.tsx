import { useState, useRef, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

/**
 * Danger-zone section for permanently deleting the user's account and all
 * associated data (shop, orders, customers). Renders a confirmation modal
 * that requires the user to type a phrase before proceeding.
 */
export default function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const baseId = useId();

  const confirmed = typed.trim().toUpperCase() === CONFIRM_PHRASE;

  /* ---- open / close the native <dialog> ---- */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else {
      dialog.close();
      setTyped("");
      setError(null);
    }
  }, [open]);

  /* Close on Escape press (native dialog does this, but reset state too). */
  function handleDialogClose() {
    setOpen(false);
  }

  /* ---- perform the deletion ---- */
  async function handleDelete() {
    if (!confirmed) return;
    setDeleting(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc("delete_own_account");

    if (rpcError) {
      setDeleting(false);
      setError(rpcError.message);
      return;
    }

    // Sign out locally so AuthProvider drops the stale session.
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  return (
    <>
      {/* ---------- Danger zone card ---------- */}
      <section
        aria-labelledby={`${baseId}-heading`}
        className="rounded-2xl border-2 border-red-200 bg-red-50/60 p-5 space-y-3"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={22}
            className="mt-0.5 shrink-0 text-red-500"
            aria-hidden="true"
          />
          <div>
            <h2
              id={`${baseId}-heading`}
              className="text-lg font-bold text-red-700"
            >
              Danger Zone
            </h2>
            <p className="text-sm text-red-600/90">
              Permanently delete your account and all data associated with it —
              your shop profile, every order, and every customer record. This
              action <strong>cannot be undone</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-red-600 px-5 text-base font-semibold text-white transition-colors hover:bg-red-700 focus-visible:ring-red-500"
        >
          <Trash2 size={18} aria-hidden="true" />
          Delete my account
        </button>
      </section>

      {/* ---------- Confirmation dialog ---------- */}
      <dialog
        ref={dialogRef}
        onClose={handleDialogClose}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-surface p-0 shadow-card backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-red-700 flex items-center gap-2">
              <AlertTriangle size={22} className="text-red-500" aria-hidden />
              Confirm Account Deletion
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cancel"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted transition-colors hover:text-ink"
            >
              <X size={20} />
            </button>
          </div>

          {/* Warning */}
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 space-y-2">
            <p className="font-semibold">
              This will permanently delete:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your shop profile and settings</li>
              <li>All order records</li>
              <li>All customer records</li>
              <li>Your Washify login</li>
            </ul>
            <p className="font-semibold">
              This action is irreversible. There is no way to recover your data.
            </p>
          </div>

          {/* Confirmation input */}
          <div>
            <label
              htmlFor={`${baseId}-confirm`}
              className="block text-sm font-semibold text-ink"
            >
              Type <span className="font-mono text-red-600">{CONFIRM_PHRASE}</span> to
              continue
            </label>
            <input
              ref={inputRef}
              id={`${baseId}-confirm`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
                setError(null);
              }}
              className="mt-1 min-h-[44px] w-full rounded-xl bg-bg px-3 text-base text-ink ring-1 ring-slate-200 placeholder:text-muted focus-visible:ring-red-500"
              placeholder={CONFIRM_PHRASE}
            />
          </div>

          {/* Error feedback */}
          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[44px] items-center rounded-xl px-4 text-base font-semibold text-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!confirmed || deleting}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-red-600 px-5 text-base font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting && (
                <Loader2 size={18} className="animate-spin" aria-hidden />
              )}
              {deleting ? "Deleting…" : "Permanently delete"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
