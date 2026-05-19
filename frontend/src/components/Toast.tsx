import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export type ToastType = 'error' | 'success';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

const AUTO_DISMISS_MS = 4000;
const EXIT_DURATION_MS = 200;

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const dismissTimer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => onDismiss(toast.id), EXIT_DURATION_MS);
    }, AUTO_DISMISS_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(dismissTimer);
    };
  }, [toast.id, onDismiss]);

  const isError = toast.type === 'error';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-200 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3'
      } ${
        isError
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
      }`}
    >
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer"
        className="shrink-0 w-5 h-5 inline-flex items-center justify-center rounded text-current opacity-60 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-opacity duration-150"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
