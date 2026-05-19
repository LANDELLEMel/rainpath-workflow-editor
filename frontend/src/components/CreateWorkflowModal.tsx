import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { ExamTypeSelect } from './ExamTypeSelect';

export interface CreateWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, examTypes: string[]) => Promise<void> | void;
}

export function CreateWorkflowModal({
  open,
  onClose,
  onCreate,
}: CreateWorkflowModalProps) {
  const [name, setName] = useState('');
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setExamTypes([]);
      setError(null);
      setSubmitting(false);
      const id = window.setTimeout(() => nameRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = name.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onCreate(name.trim(), examTypes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création',
      );
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workflow-title"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-6 w-[440px] max-w-[90vw] animate-[scaleIn_200ms_cubic-bezier(0.34,1.56,0.64,1)]"
      >
        <header className="flex items-center justify-between mb-4">
          <h2
            id="create-workflow-title"
            className="text-lg font-semibold text-gray-900"
          >
            Nouveau workflow
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="workflow-name"
              className="block text-xs font-medium text-gray-500"
            >
              Nom du workflow
            </label>
            <input
              ref={nameRef}
              id="workflow-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Relance standard Histologie"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 transition-all duration-150"
            />
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-gray-500">
              Types d'examen concernés
            </span>
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 min-h-[40px] flex items-center">
              <ExamTypeSelect
                value={examTypes}
                onChange={setExamTypes}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-9 px-4 rounded-lg bg-[#E85D4A] hover:bg-[#D14D3B] text-white text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/30 focus-visible:ring-offset-1 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Création…' : 'Créer'}
          </button>
        </footer>
      </form>
    </div>
  );
}
