import React, { useState } from 'react';
import { Info, Settings2 } from 'lucide-react';
import { CHANNEL_CONFIG, CHANNEL_ORDER } from '../config/channels';
import type { ChannelType, NodeConfig } from '../types/workflow';
import { NodeProperties } from './panels/NodeProperties';

export interface SelectedNodeInfo {
  id: string;
  channelType: ChannelType;
  label: string;
  sublabel?: string;
  config: NodeConfig;
  canAddReminder: boolean;
  remainingReminders: number;
}

export interface RightPanelProps {
  globalTimeout: number;
  onChangeGlobalTimeout: (days: number) => void;
  selectedNode: SelectedNodeInfo | null;
  onChangeNodeLabel: (nodeId: string, label: string) => void;
  onAddReminder: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onOpenMessageModal: (nodeId: string) => void;
}

const TIMEOUT_OPTIONS = [3, 7, 10, 14, 21, 30];

const CHANNEL_DRAG_MIME = 'application/x-rainpath-channel';

export function RightPanel({
  globalTimeout,
  onChangeGlobalTimeout,
  selectedNode,
  onChangeNodeLabel,
  onAddReminder,
  onDeleteNode,
  onOpenMessageModal,
}: RightPanelProps) {
  const [draggingChannel, setDraggingChannel] = useState<
    ChannelType | null
  >(null);

  return (
    <aside
      role="toolbar"
      aria-label="Outils workflow"
      className="h-full flex flex-col bg-white border-l border-gray-200"
    >
      <div className="px-4 h-12 flex items-center border-b border-gray-100 shrink-0">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Outils
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section className="space-y-2">
          {CHANNEL_ORDER.map((ct) => {
            const cfg = CHANNEL_CONFIG[ct];
            const Icon = cfg.icon;
            const isDragging = draggingChannel === ct;
            return (
              <div
                key={ct}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(CHANNEL_DRAG_MIME, ct);
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggingChannel(ct);
                }}
                onDragEnd={() => setDraggingChannel(null)}
                tabIndex={0}
                className={`flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-all duration-150 ${
                  isDragging ? 'opacity-50' : ''
                }`}
                style={{
                  borderColor: isDragging ? cfg.color : undefined,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cfg.light }}
                >
                  <Icon size={20} color={cfg.color} />
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {cfg.label}
                </div>
              </div>
            );
          })}
        </section>

        {selectedNode && (
          <>
            <div className="border-t border-gray-100" />
            <NodeProperties
              key={selectedNode.id}
              nodeId={selectedNode.id}
              channelType={selectedNode.channelType}
              label={selectedNode.label}
              sublabel={selectedNode.sublabel}
              config={selectedNode.config}
              canAddReminder={selectedNode.canAddReminder}
              remainingReminders={selectedNode.remainingReminders}
              onChangeLabel={(label) =>
                onChangeNodeLabel(selectedNode.id, label)
              }
              onAddReminder={() => onAddReminder(selectedNode.id)}
              onDelete={() => onDeleteNode(selectedNode.id)}
              onOpenMessageModal={() =>
                onOpenMessageModal(selectedNode.id)
              }
            />
          </>
        )}

        <div className="border-t border-gray-100" />

        <GlobalRules
          globalTimeout={globalTimeout}
          onChangeGlobalTimeout={onChangeGlobalTimeout}
        />
      </div>
    </aside>
  );
}

function GlobalRules({
  globalTimeout,
  onChangeGlobalTimeout,
}: {
  globalTimeout: number;
  onChangeGlobalTimeout: (days: number) => void;
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipTimer = React.useRef<number | null>(null);

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 relative">
        <Settings2 size={14} className="text-gray-500" />
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Règle de passage
        </h3>
        <div
          className="relative"
          onMouseEnter={() => {
            if (tooltipTimer.current) window.clearTimeout(tooltipTimer.current);
            tooltipTimer.current = window.setTimeout(() => setTooltipOpen(true), 200);
          }}
          onMouseLeave={() => {
            if (tooltipTimer.current) window.clearTimeout(tooltipTimer.current);
            tooltipTimer.current = null;
            setTooltipOpen(false);
          }}
          onFocus={() => setTooltipOpen(true)}
          onBlur={() => setTooltipOpen(false)}
        >
          <button
            type="button"
            aria-label="À propos de la règle de passage"
            className="w-5 h-5 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
          >
            <Info size={12} />
          </button>
          {tooltipOpen && (
            <div
              role="tooltip"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[240px] w-max"
            >
              Cette règle s'applique à toutes les transitions entre
              canaux.
              <span
                className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Si la communication n'a pas été ouverte après
      </p>
      <select
        value={globalTimeout}
        onChange={(e) =>
          onChangeGlobalTimeout(Number(e.target.value))
        }
        className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 transition-all duration-150"
      >
        {TIMEOUT_OPTIONS.map((d) => (
          <option key={d} value={d}>
            {d} jours
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">passer au canal suivant.</p>
    </section>
  );
}
