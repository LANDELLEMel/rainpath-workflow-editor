import type { Edge, Node } from '@xyflow/react';
import type {
  UpdateWorkflowInput,
  WorkflowEdge,
  WorkflowNode,
} from '../types/workflow';
import { isChannelType } from '../config/channels';
import { COLUMN_STRIDE, ROW_STRIDE } from './gridLayout';

export interface SerializeOptions {
  name?: string;
  examTypes?: string[];
  globalTimeout?: number;
}

export function serializeWorkflow(
  nodes: Node[],
  edges: Edge[],
  options: SerializeOptions = {},
): UpdateWorkflowInput {
  const serializedNodes: WorkflowNode[] = nodes.map((n) => {
    const d = (n.data ?? {}) as Record<string, unknown>;
    const gridCol =
      typeof d.gridCol === 'number'
        ? d.gridCol
        : Math.round(n.position.x / COLUMN_STRIDE);
    const gridRow =
      typeof d.gridRow === 'number'
        ? d.gridRow
        : Math.round(n.position.y / ROW_STRIDE);

    let nodeType: WorkflowNode['type'];
    if (n.type === 'start') nodeType = 'start';
    else if (n.type === 'end') nodeType = 'end';
    else {
      const ct = typeof d.channelType === 'string' ? d.channelType : '';
      nodeType = isChannelType(ct) ? ct : 'email';
    }

    const config =
      typeof d.config === 'object' && d.config !== null
        ? (d.config as Record<string, unknown>)
        : {};

    return {
      id: n.id,
      type: nodeType,
      label: typeof d.label === 'string' ? d.label : '',
      positionX: n.position.x,
      positionY: n.position.y,
      gridCol,
      gridRow,
      config,
    };
  });

  const serializedEdges: WorkflowEdge[] = edges.map((e) => {
    const data = (e.data ?? {}) as { delayDays?: number };
    const type =
      e.type === 'reminder' || e.type === 'escalation'
        ? e.type
        : 'escalation';
    return {
      id: e.id,
      sourceId: e.source,
      targetId: e.target,
      type,
      delayDays:
        typeof data.delayDays === 'number' ? data.delayDays : null,
    };
  });

  return {
    ...(options.name !== undefined && { name: options.name }),
    ...(options.examTypes !== undefined && {
      examTypes: options.examTypes,
    }),
    ...(options.globalTimeout !== undefined && {
      globalTimeout: options.globalTimeout,
    }),
    nodes: serializedNodes,
    edges: serializedEdges,
  };
}
