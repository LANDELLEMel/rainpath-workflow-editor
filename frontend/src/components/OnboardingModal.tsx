import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  GripVertical,
  Info,
  X,
} from 'lucide-react';

export interface OnboardingModalProps {
  open: boolean;
  onDismiss: (dontShowAgain: boolean) => void;
}

export function OnboardingModal({ open, onDismiss }: OnboardingModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(true);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss(dontShowAgain);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, dontShowAgain, onDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      onClick={() => onDismiss(dontShowAgain)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-6 w-[480px] max-w-[92vw] animate-[scaleIn_200ms_cubic-bezier(0.34,1.56,0.64,1)]"
      >
        <header className="flex items-start justify-between mb-4">
          <h2
            id="onboarding-title"
            className="text-lg font-semibold text-gray-900"
          >
            Bienvenue dans l'éditeur de workflows
          </h2>
          <button
            type="button"
            onClick={() => onDismiss(dontShowAgain)}
            aria-label="Fermer"
            className="w-8 h-8 -mt-1 -mr-1 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </header>

        <ul className="space-y-3.5">
          <li className="flex items-start gap-3 text-sm text-gray-600">
            <GripVertical
              size={16}
              className="shrink-0 mt-0.5 text-gray-400"
            />
            <span>
              Glissez les canaux de communication depuis le panneau de
              droite pour construire votre séquence de relance.
            </span>
          </li>
          <li className="flex items-start gap-3 text-sm text-gray-600">
            <span className="shrink-0 mt-0.5 inline-flex items-center gap-0.5 text-gray-400">
              <ArrowRight size={14} />
              <ArrowDown size={14} />
            </span>
            <span>
              L'axe horizontal représente l'escalade vers un nouveau
              canal. L'axe vertical, les relances sur le même canal.
            </span>
          </li>
          <li className="flex items-start gap-3 text-sm text-gray-600">
            <Info size={16} className="shrink-0 mt-0.5 text-gray-400" />
            <span>
              Si un canal est indisponible pour un patient (email
              inconnu, numéro invalide…), le système passe
              automatiquement au canal suivant.
            </span>
          </li>
        </ul>

        <footer className="flex items-center justify-between mt-6">
          <label className="inline-flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 accent-[#E85D4A]"
            />
            Ne plus afficher
          </label>
          <button
            type="button"
            onClick={() => onDismiss(dontShowAgain)}
            className="h-9 px-4 rounded-lg bg-[#E85D4A] hover:bg-[#D14D3B] text-white text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/30 focus-visible:ring-offset-1 transition-colors duration-150"
          >
            C'est compris
          </button>
        </footer>
      </div>
    </div>
  );
}
