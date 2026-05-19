import { memo, useEffect, useRef, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { Clock, ChevronDown } from 'lucide-react';
import { CHANNEL_CONFIG, isChannelType } from '../../config/channels';

const DELAY_OPTIONS = [1, 3, 7, 14, 30] as const;

export interface DelayEdgeData {
  delayDays?: number;
  channelType?: string;
  onChangeDelay?: (edgeId: string, days: number) => void;
}

function DelayEdgeComponent(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    data,
  } = props;
  const d = (data ?? {}) as DelayEdgeData;
  const channelColor =
    d.channelType && isChannelType(d.channelType)
      ? CHANNEL_CONFIG[d.channelType].color
      : '#9CA3AF';
  const delayDays = d.delayDays ?? 7;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as globalThis.Node | null)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: channelColor,
          strokeOpacity: 0.5,
          strokeWidth: 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow transition-all duration-150"
            style={{
              borderColor: open ? channelColor : undefined,
            }}
          >
            <Clock size={12} className="text-gray-400" />
            <span className="text-gray-600">{delayDays}j</span>
            <ChevronDown size={10} className="text-gray-400" />
          </button>
          {open && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-md py-1 z-10 min-w-[64px]">
              {DELAY_OPTIONS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    d.onChangeDelay?.(id, days);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1 text-xs hover:bg-gray-50 transition-colors duration-100 ${
                    days === delayDays
                      ? 'font-medium text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  {days}j
                </button>
              ))}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const DelayEdge = memo(DelayEdgeComponent);
