export default function ConfirmDialog({ title, body, confirmLabel = 'Delete', busy, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/85 p-5 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="glass-card w-full max-w-sm rounded-3xl p-8 text-center">
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="mt-3 text-sm text-cream/55">{body}</p>
        <div className="mt-8 space-y-3">
          <button
            onClick={onConfirm} disabled={busy}
            className="w-full rounded-full border border-red-500/40 bg-red-500/15 py-3.5 text-sm font-bold text-red-200 transition hover:bg-red-500/25 disabled:opacity-60"
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
          <button
            onClick={onCancel} disabled={busy}
            className="btn-ghost w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
