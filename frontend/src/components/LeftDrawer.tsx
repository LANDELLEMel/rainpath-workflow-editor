import { useEffect, useRef, useState } from 'react';
import { Plus, Search, Trash2, Workflow } from 'lucide-react';
import type { WorkflowSummary } from '../types/workflow';

export interface LeftDrawerProps {
  workflows: WorkflowSummary[];
  activeWorkflowId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => Promise<void> | void;
  loading?: boolean;
}

function parseExamTypes(examTypes: string[] | string): string[] {
  if (Array.isArray(examTypes)) return examTypes;
  try {
    const parsed = JSON.parse(examTypes);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'hier';
  if (diffD < 7) return `il y a ${diffD}j`;
  return date.toLocaleDateString('fr-FR');
}

export function LeftDrawer({
  workflows,
  activeWorkflowId,
  onSelect,
  onCreate,
  onDelete,
  loading,
}: LeftDrawerProps) {
  const [search, setSearch] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const confirmTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    };
  }, []);

  const filtered = workflows.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase().trim()),
  );

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirmingId === id) {
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
      setConfirmingId(null);
      void onDelete(id);
      return;
    }
    setConfirmingId(id);
    if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    confirmTimer.current = window.setTimeout(
      () => setConfirmingId(null),
      3000,
    );
  }

  return (
    <nav
      className="h-full flex flex-col bg-white border-r border-gray-200"
      role="navigation"
      aria-label="Liste des workflows"
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100 shrink-0">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Workflows
        </span>
        <button
          type="button"
          onClick={onCreate}
          aria-label="Créer un workflow"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="px-3 py-2 border-b border-gray-100 shrink-0">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 transition-all duration-150"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="px-4 space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E85D4A]/10 flex items-center justify-center">
              <Workflow size={22} className="text-[#E85D4A]" />
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-sm font-medium text-gray-900">
                Aucun workflow
              </p>
              <p className="text-xs text-gray-500">
                Créez votre premier workflow de relance
              </p>
            </div>
            <button
              type="button"
              onClick={onCreate}
              className="mt-1 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#E85D4A] hover:bg-[#D14D3B] text-white text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/30 focus-visible:ring-offset-1 transition-colors duration-150"
            >
              <Plus size={14} />
              Nouveau workflow
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-gray-400">
              Aucun résultat pour "{search}"
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((w) => {
              const isActive = w.id === activeWorkflowId;
              const isConfirming = confirmingId === w.id;
              const exam = parseExamTypes(w.examTypes);
              const examLabel =
                exam.length === 0
                  ? 'Tous examens'
                  : exam.length === 1
                    ? exam[0]
                    : `${exam.length} types`;
              const channels = w._count?.nodes
                ? Math.max(w._count.nodes - 1, 0)
                : 0;
              return (
                <li key={w.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(w.id)}
                    className={`w-full text-left px-4 py-3 pr-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 focus-visible:ring-inset transition-colors duration-150 ${
                      isActive
                        ? 'bg-[#E85D4A]/5'
                        : 'hover:bg-gray-50'
                    }`}
                    style={
                      isActive
                        ? { borderLeft: '3px solid #E85D4A' }
                        : { borderLeft: '3px solid transparent' }
                    }
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {w.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {examLabel} · {channels}{' '}
                      {channels > 1 ? 'canaux' : 'canal'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Modifié {formatRelative(w.updatedAt)}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(w.id, e)}
                    aria-label={
                      isConfirming
                        ? 'Confirmer la suppression'
                        : 'Supprimer ce workflow'
                    }
                    className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-all duration-150 ${
                      isConfirming
                        ? 'h-7 px-2 bg-red-500 text-white hover:bg-red-600 text-xs font-medium'
                        : 'w-7 h-7 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
                    }`}
                    style={
                      isConfirming ? { opacity: 1 } : undefined
                    }
                  >
                    {isConfirming ? (
                      'Confirmer'
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}
