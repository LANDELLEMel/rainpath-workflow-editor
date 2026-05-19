import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { CHANNEL_CONFIG } from '../config/channels';
import type { ChannelType, NodeConfig } from '../types/workflow';

const VARIABLES = [
  '{nom_patient}',
  '{prenom_patient}',
  '{ref_examen}',
  '{montant}',
  '{date_examen}',
  '{nom_labo}',
];

export interface MessageModalProps {
  open: boolean;
  channelType: ChannelType;
  config: NodeConfig;
  onSave: (config: NodeConfig) => void;
  onClose: () => void;
}

export function MessageModal({
  open,
  channelType,
  config,
  onSave,
  onClose,
}: MessageModalProps) {
  const cfg = CHANNEL_CONFIG[channelType];
  const Icon = cfg.icon;
  const [values, setValues] = useState<NodeConfig>(config);
  const lastFocused = useRef<
    HTMLInputElement | HTMLTextAreaElement | null
  >(null);
  const lastFocusedKey = useRef<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues({ ...config });
      lastFocused.current = null;
      lastFocusedKey.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, channelType]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function insertVariable(variable: string) {
    const target = lastFocused.current;
    const key = lastFocusedKey.current ?? cfg.configFields[0]?.key;
    if (!key) return;
    if (target) {
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const before = target.value.slice(0, start);
      const after = target.value.slice(end);
      const next = `${before}${variable}${after}`;
      setValues((v) => ({ ...v, [key]: next }));
      requestAnimationFrame(() => {
        target.focus();
        const pos = start + variable.length;
        target.setSelectionRange(pos, pos);
      });
    } else {
      setValues((v) => ({
        ...v,
        [key]: `${(v[key] as string | undefined) ?? ''}${variable}`,
      }));
    }
  }

  function handleSave() {
    onSave(values);
  }

  function setValue(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-6 w-[560px] max-w-[92vw] animate-[scaleIn_200ms_cubic-bezier(0.34,1.56,0.64,1)]"
      >
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: cfg.light }}
            >
              <Icon size={16} color={cfg.color} />
            </div>
            <h2
              id="message-modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              Personnaliser — {cfg.label}
            </h2>
          </div>
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
          {cfg.configFields.map((field) => {
            const value = (values[field.key] as string | undefined) ?? '';
            return (
              <div key={field.key} className="space-y-1.5">
                <label
                  htmlFor={`field-${field.key}`}
                  className="block text-xs font-medium text-gray-500"
                >
                  {field.label}
                </label>
                {field.type === 'text' ? (
                  <input
                    id={`field-${field.key}`}
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setValue(field.key, e.target.value)
                    }
                    onFocus={(e) => {
                      lastFocused.current = e.currentTarget;
                      lastFocusedKey.current = field.key;
                    }}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 transition-all duration-150"
                  />
                ) : (
                  <textarea
                    id={`field-${field.key}`}
                    value={value}
                    onChange={(e) =>
                      setValue(field.key, e.target.value)
                    }
                    onFocus={(e) => {
                      lastFocused.current = e.currentTarget;
                      lastFocusedKey.current = field.key;
                    }}
                    rows={6}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 transition-all duration-150 resize-y font-mono"
                  />
                )}
              </div>
            );
          })}

          <div className="space-y-2">
            <span className="block text-xs font-medium text-gray-500">
              Variables disponibles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertVariable(v)}
                  className="px-2 py-1 rounded-md text-xs font-mono bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-100"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
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
            type="button"
            onClick={handleSave}
            className="h-9 px-4 rounded-lg bg-[#E85D4A] hover:bg-[#D14D3B] text-white text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/30 focus-visible:ring-offset-1 transition-colors duration-150"
          >
            Enregistrer
          </button>
        </footer>
      </div>
    </div>
  );
}
