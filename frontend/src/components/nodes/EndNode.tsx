import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckCircle2 } from 'lucide-react';

export interface EndNodeData {
  label?: string;
}

function EndNodeComponent({ data, selected }: NodeProps) {
  const d = (data ?? {}) as EndNodeData;
  return (
    <div
      className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 transition-all duration-150 animate-[nodeAppear_250ms_cubic-bezier(0.34,1.56,0.64,1)]"
      style={{
        width: 160,
        height: 44,
        borderRadius: 9999,
        outline: selected ? '2px solid #10B981' : 'none',
        outlineOffset: selected ? 2 : 0,
        boxShadow: selected ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
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
      <CheckCircle2 size={16} className="text-emerald-500" />
      <span className="text-sm font-medium text-emerald-700">
        {d.label ?? 'Résultat retiré'}
      </span>
    </div>
  );
}

export const EndNode = memo(EndNodeComponent);
