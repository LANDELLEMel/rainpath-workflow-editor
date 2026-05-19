import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

const CORAIL = '#E85D4A';

export interface StartNodeData {
  label?: string;
  sublabel?: string;
}

function StartNodeComponent({ data, selected }: NodeProps) {
  const d = (data ?? {}) as StartNodeData;
  return (
    <div
      className="relative flex items-center gap-3 bg-white rounded-xl transition-all duration-150 animate-[nodeAppear_250ms_cubic-bezier(0.34,1.56,0.64,1)]"
      style={{
        width: 200,
        height: 88,
        borderLeft: `3px solid ${CORAIL}`,
        boxShadow: selected
          ? '0 4px 6px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        outline: selected ? `2px solid ${CORAIL}` : 'none',
        outlineOffset: selected ? 2 : 0,
      }}
    >
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
      <div className="flex items-center gap-3 px-4 w-full">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(232, 93, 74, 0.1)' }}
        >
          <Play size={20} style={{ color: CORAIL }} fill={CORAIL} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {d.label ?? 'Examen effectué'}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {d.sublabel ?? 'Point de départ'}
          </div>
        </div>
      </div>
    </div>
  );
}

export const StartNode = memo(StartNodeComponent);
