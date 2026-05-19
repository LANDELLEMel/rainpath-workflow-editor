import { useCallback, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { StartNode } from './nodes/StartNode';
import { ChannelNode } from './nodes/ChannelNode';
import { EndNode } from './nodes/EndNode';
import { EscalationEdge } from './edges/EscalationEdge';
import { DelayEdge } from './edges/DelayEdge';
import { CHANNEL_CONFIG, isChannelType } from '../config/channels';
import type { ChannelType } from '../types/workflow';

const nodeTypes: NodeTypes = {
  start: StartNode,
  channel: ChannelNode,
  end: EndNode,
};

const edgeTypes: EdgeTypes = {
  escalation: EscalationEdge,
  reminder: DelayEdge,
};

const CANVAS_CONFIG = {
  minZoom: 0.3,
  maxZoom: 1.5,
  defaultZoom: 0.85,
};

const CHANNEL_DRAG_MIME = 'application/x-rainpath-channel';

function ZoomControls({ onUndo }: { onUndo?: () => void }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const buttonClass =
    'w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 focus-visible:ring-offset-1 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <div className="absolute bottom-6 left-6 flex flex-col gap-1 z-10 shadow-sm rounded-lg">
      <button
        type="button"
        aria-label="Zoom avant"
        onClick={() => zoomIn({ duration: 150 })}
        className={buttonClass}
      >
        <ZoomIn size={16} />
      </button>
      <button
        type="button"
        aria-label="Zoom arrière"
        onClick={() => zoomOut({ duration: 150 })}
        className={buttonClass}
      >
        <ZoomOut size={16} />
      </button>
      <button
        type="button"
        aria-label="Ajuster à la vue"
        onClick={() => fitView({ padding: 0.2, duration: 250 })}
        className={buttonClass}
      >
        <Maximize2 size={16} />
      </button>
      <button
        type="button"
        aria-label="Annuler"
        onClick={onUndo}
        className={buttonClass}
        disabled={!onUndo}
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}

export interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: Parameters<typeof ReactFlow>[0]['onNodesChange'];
  onEdgesChange?: Parameters<typeof ReactFlow>[0]['onEdgesChange'];
  onConnect?: Parameters<typeof ReactFlow>[0]['onConnect'];
  onNodeClick?: Parameters<typeof ReactFlow>[0]['onNodeClick'];
  onPaneClick?: Parameters<typeof ReactFlow>[0]['onPaneClick'];
  onUndo?: () => void;
  onAddChannelNode?: (
    channelType: ChannelType,
    position: { x: number; y: number },
  ) => void;
}

function CanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onUndo,
  onAddChannelNode,
}: CanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [isDropOver, setIsDropOver] = useState(false);
  const channelNodeCount = nodes.filter((n) => n.type === 'channel').length;

  const nodeColor = useCallback((node: Node) => {
    if (node.type === 'start') return '#E85D4A';
    if (node.type === 'end') return '#10B981';
    const ct = (node.data as { channelType?: string } | undefined)
      ?.channelType;
    if (ct && isChannelType(ct)) return CHANNEL_CONFIG[ct].color;
    return '#E5E7EB';
  }, []);

  const defaultViewport = useMemo(
    () => ({ x: 0, y: 0, zoom: CANVAS_CONFIG.defaultZoom }),
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const types = Array.from(e.dataTransfer.types);
      if (!types.includes(CHANNEL_DRAG_MIME)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsDropOver(true);
    },
    [],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const related = e.relatedTarget as globalThis.Node | null;
      if (related && e.currentTarget.contains(related)) return;
      setIsDropOver(false);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const raw = e.dataTransfer.getData(CHANNEL_DRAG_MIME);
      if (!raw || !isChannelType(raw)) return;
      e.preventDefault();
      setIsDropOver(false);
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      onAddChannelNode?.(raw, position);
    },
    [screenToFlowPosition, onAddChannelNode],
  );

  return (
    <div
      className={`relative w-full h-full bg-[#F9FAFB] transition-colors duration-150 ${
        isDropOver ? 'canvas-drop-active' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        minZoom={CANVAS_CONFIG.minZoom}
        maxZoom={CANVAS_CONFIG.maxZoom}
        defaultViewport={defaultViewport}
        zoomOnScroll
        zoomOnPinch
        panOnScroll={false}
        panOnDrag
        selectionOnDrag={false}
        fitView
        fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#E5E7EB"
          bgColor="#F9FAFB"
        />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={nodeColor}
          maskColor="rgba(0, 0, 0, 0.08)"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            width: 180,
            height: 120,
            right: 24,
            bottom: 24,
          }}
        />
      </ReactFlow>
      <ZoomControls onUndo={onUndo} />

      {channelNodeCount === 0 && !isDropOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <div className="text-center px-6">
            <div className="text-gray-400 text-sm font-medium">
              Glissez un canal depuis le panneau de droite
            </div>
            <div className="text-gray-300 text-xs mt-1">
              pour commencer votre séquence de relance
            </div>
          </div>
        </div>
      )}

      {isDropOver && (
        <div
          className="canvas-drop-indicator pointer-events-none absolute inset-4 rounded-2xl border-2 border-dashed z-10"
        />
      )}
    </div>
  );
}

export function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
