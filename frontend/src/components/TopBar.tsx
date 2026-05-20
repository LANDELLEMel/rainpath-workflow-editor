import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ExamTypeSelect } from './ExamTypeSelect';
import type { AppTab } from '../types/workflow';

export type SaveStatus = 'idle' | 'saving' | 'saved';

export interface TopBarProps {
  workflowName: string;
  onWorkflowNameChange: (next: string) => void;
  examTypes: string[];
  onExamTypesChange: (next: string[]) => void;
  saveStatus: SaveStatus;
  leftDrawerOpen: boolean;
  onToggleLeftDrawer: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TABS: ReadonlyArray<{ value: AppTab; label: string }> = [
  { value: 'editor', label: 'Éditeur' },
  { value: 'stats', label: 'Statistiques' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'config', label: 'Configuration' },
];

export function TopBar({
  workflowName,
  onWorkflowNameChange,
  examTypes,
  onExamTypesChange,
  saveStatus,
  leftDrawerOpen,
  onToggleLeftDrawer,
  rightPanelOpen,
  onToggleRightPanel,
  activeTab,
  onTabChange,
}: TopBarProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(workflowName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(workflowName);
  }, [workflowName]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    const next = draft.trim();
    if (next && next !== workflowName) {
      onWorkflowNameChange(next);
    } else {
      setDraft(workflowName);
    }
    setEditing(false);
  }

  const isEditorTab = activeTab === 'editor';

  return (
    <header
      className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 shrink-0"
      role="banner"
    >
      <div className="flex items-center gap-3 min-w-0">
        {isEditorTab && (
          <button
            type="button"
            onClick={onToggleLeftDrawer}
            aria-label={
              leftDrawerOpen ? 'Fermer le drawer' : 'Ouvrir le drawer'
            }
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
          >
            {leftDrawerOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        )}
        <img
          src="/assets/rainpath-logo.svg"
          alt="RainPath"
          className="h-7 w-auto select-none"
          draggable={false}
        />
        <div className="w-px h-6 bg-gray-200 mx-1" />
        {isEditorTab ? (
          editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                else if (e.key === 'Escape') {
                  setDraft(workflowName);
                  setEditing(false);
                }
              }}
              className="h-9 px-2 rounded-lg border border-gray-200 focus:border-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 outline-none text-sm text-gray-900 min-w-0 w-64"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sm font-medium text-gray-900 truncate px-2 h-9 inline-flex items-center rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
              title="Cliquer pour renommer"
            >
              {workflowName || 'Sans titre'}
            </button>
          )
        ) : (
          <span className="text-sm font-medium text-gray-900 truncate px-2 h-9 inline-flex items-center">
            {workflowName || 'Sans titre'}
          </span>
        )}
        <ExamTypeSelect
          value={examTypes}
          onChange={onExamTypesChange}
          readOnly={!isEditorTab}
        />
      </div>

      <div className="flex items-center gap-3">
        <SegmentedTabs activeTab={activeTab} onTabChange={onTabChange} />
        {isEditorTab && (
          <>
            <SaveIndicator status={saveStatus} />
            <button
              type="button"
              onClick={onToggleRightPanel}
              aria-label={
                rightPanelOpen ? 'Fermer le panneau' : 'Ouvrir le panneau'
              }
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
            >
              {rightPanelOpen ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function SegmentedTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Sections"
      className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5"
    >
      {TABS.map((t) => {
        const active = t.value === activeTab;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(t.value)}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-all duration-150 ${
              active
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <div
        className="inline-flex items-center gap-1.5 text-xs text-gray-500"
        aria-live="polite"
      >
        <Loader2 size={12} className="animate-spin" />
        Enregistrement…
      </div>
    );
  }
  if (status === 'saved') {
    return (
      <div
        className="inline-flex items-center gap-1.5 text-xs text-emerald-600"
        aria-live="polite"
      >
        <Check size={12} />
        Enregistré
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      Brouillon
    </div>
  );
}
