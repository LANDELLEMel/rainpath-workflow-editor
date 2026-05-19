import { useEffect, useRef, useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { CHANNEL_CONFIG } from '../../config/channels';
import type { ChannelType, NodeConfig } from '../../types/workflow';

export interface NodePropertiesProps {
  nodeId: string;
  channelType: ChannelType;
  label: string;
  sublabel?: string;
  config: NodeConfig;
  canAddReminder: boolean;
  remainingReminders: number;
  onChangeLabel: (label: string) => void;
  onAddReminder: () => void;
  onDelete: () => void;
  onOpenMessageModal: () => void;
}

export function NodeProperties({
  channelType,
  label,
  sublabel,
  config,
  canAddReminder,
  remainingReminders,
  onChangeLabel,
  onAddReminder,
  onDelete,
  onOpenMessageModal,
}: NodePropertiesProps) {
  const cfg = CHANNEL_CONFIG[channelType];
  const Icon = cfg.icon;
  const [draft, setDraft] = useState(label);
  const [confirming, setConfirming] = useState(false);
  const confirmTimer = useRef<number | null>(null);

  useEffect(() => {
    setDraft(label);
  }, [label]);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    };
  }, []);

  function commitLabel() {
    const next = draft.trim();
    if (next && next !== label) onChangeLabel(next);
    else setDraft(label);
  }

  function handleDelete() {
    if (confirming) {
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
      setConfirming(false);
      onDelete();
      return;
    }
    setConfirming(true);
    confirmTimer.current = window.setTimeout(
      () => setConfirming(false),
      3000,
    );
  }

  const hasConfig = Object.keys(config ?? {}).length > 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Propriétés
        </h3>
      </div>

      <div
        className="rounded-xl border border-gray-200 overflow-hidden bg-white"
        style={{ borderTop: `4px solid ${cfg.color}` }}
      >
        <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: cfg.light }}
          >
            <Icon size={18} color={cfg.color} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {cfg.label}
            </div>
            {sublabel && (
              <div className="text-xs text-gray-500 truncate">
                {sublabel}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">
              Nom du bloc
            </label>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  (e.target as HTMLInputElement).blur();
                } else if (e.key === 'Escape') {
                  setDraft(label);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 transition-all duration-150"
            />
          </div>

          <button
            type="button"
            onClick={onOpenMessageModal}
            className="w-full inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-all duration-150"
          >
            <Edit3 size={14} />
            {hasConfig
              ? 'Modifier le message'
              : 'Personnaliser le message'}
          </button>

          {hasConfig && (
            <div className="text-xs text-gray-500 px-1">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle"
                aria-hidden="true"
              />
              Message personnalisé
            </div>
          )}

          <button
            type="button"
            onClick={onAddReminder}
            disabled={!canAddReminder}
            className="w-full inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-dashed border-gray-300 bg-white text-sm font-medium text-gray-600 hover:border-[#E85D4A]/40 hover:text-[#E85D4A] hover:bg-[#E85D4A]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600 disabled:hover:bg-white"
            title={
              canAddReminder
                ? undefined
                : `Maximum ${cfg.maxReminders} relance${cfg.maxReminders > 1 ? 's' : ''} pour ce canal`
            }
          >
            <Plus size={14} />
            Ajouter une relance
            {canAddReminder && remainingReminders > 0 && (
              <span className="text-xs text-gray-400 font-normal">
                ({remainingReminders} restante
                {remainingReminders > 1 ? 's' : ''})
              </span>
            )}
          </button>
        </div>

        <div className="border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={handleDelete}
            className={`w-full inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 transition-all duration-150 ${
              confirming
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'text-red-500 hover:bg-red-50'
            }`}
          >
            <Trash2 size={14} />
            {confirming ? 'Confirmer la suppression' : 'Supprimer ce bloc'}
          </button>
        </div>
      </div>
    </section>
  );
}
