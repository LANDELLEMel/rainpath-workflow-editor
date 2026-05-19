import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CHANNEL_CONFIG } from '../../config/channels';
import type { ChannelType } from '../../types/workflow';

export interface ChannelNodeData {
  channelType: ChannelType;
  label?: string;
  sublabel?: string;
  isConfigured?: boolean;
}

function ChannelNodeComponent({ data, selected }: NodeProps) {
  const d = (data ?? {}) as unknown as ChannelNodeData;
  const channelType: ChannelType = d.channelType ?? 'email';
  const cfg = CHANNEL_CONFIG[channelType];
  const Icon = cfg.icon;

  return (
    <div
      className="relative flex items-center bg-white rounded-xl transition-all duration-150 animate-[nodeAppear_250ms_cubic-bezier(0.34,1.56,0.64,1)]"
      style={{
        width: 200,
        height: 88,
        borderLeft: `3px solid ${cfg.color}`,
        boxShadow: selected
          ? '0 4px 6px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        outline: selected ? `2px solid ${cfg.color}` : 'none',
        outlineOffset: selected ? 2 : 0,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#D1D5DB',
          width: 8,
          height: 8,
          border: 'none',
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: '#D1D5DB',
          width: 8,
          height: 8,
          border: 'none',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#D1D5DB',
          width: 8,
          height: 8,
          border: 'none',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: '#D1D5DB',
          width: 8,
          height: 8,
          border: 'none',
        }}
      />
      <div className="flex items-center gap-3 px-4 w-full">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: cfg.light }}
        >
          <Icon size={20} color={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {d.label ?? cfg.label}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {d.sublabel ?? 'Première relance'}
          </div>
        </div>
        {d.isConfigured && (
          <div
            className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
            title="Message personnalisé"
          />
        )}
      </div>
    </div>
  );
}

export const ChannelNode = memo(ChannelNodeComponent);
