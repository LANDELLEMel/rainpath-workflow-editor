import { useCallback, useEffect, useRef } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { updateWorkflow } from '../api/workflows';
import {
  serializeWorkflow,
  type SerializeOptions,
} from '../utils/workflowSerializer';
import type { SaveStatus } from '../components/TopBar';

const DEBOUNCE_MS = 2000;
const SAVED_HOLD_MS = 3000;

export function useAutoSave(
  workflowId: string | null,
  nodes: Node[],
  edges: Edge[],
  options: SerializeOptions,
  onStatusChange: (status: SaveStatus) => void,
  onSaved?: (workflowId: string) => void,
): { saveNow: () => Promise<void> } {
  const debounceTimer = useRef<number | null>(null);
  const savedTimer = useRef<number | null>(null);
  const latestPayload = useRef<string>('');
  const firstRun = useRef(true);
  const lastWorkflowId = useRef<string | null>(null);

  const save = useCallback(async () => {
    if (!workflowId) return;
    const payload = serializeWorkflow(nodes, edges, options);
    const key = JSON.stringify(payload);
    if (key === latestPayload.current) return;
    latestPayload.current = key;

    if (savedTimer.current) {
      window.clearTimeout(savedTimer.current);
      savedTimer.current = null;
    }
    onStatusChange('saving');
    try {
      await updateWorkflow(workflowId, payload);
      onSaved?.(workflowId);
      onStatusChange('saved');
      savedTimer.current = window.setTimeout(() => {
        onStatusChange('idle');
        savedTimer.current = null;
      }, SAVED_HOLD_MS);
    } catch (err) {
      console.error('Auto-save failed', err);
      onStatusChange('idle');
    }
  }, [workflowId, nodes, edges, options, onStatusChange, onSaved]);

  useEffect(() => {
    if (!workflowId) {
      lastWorkflowId.current = null;
      latestPayload.current = '';
      firstRun.current = true;
      return;
    }

    if (workflowId !== lastWorkflowId.current) {
      lastWorkflowId.current = workflowId;
      latestPayload.current = JSON.stringify(
        serializeWorkflow(nodes, edges, options),
      );
      firstRun.current = false;
      return;
    }

    if (firstRun.current) {
      firstRun.current = false;
      latestPayload.current = JSON.stringify(
        serializeWorkflow(nodes, edges, options),
      );
      return;
    }

    if (debounceTimer.current)
      window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      void save();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current)
        window.clearTimeout(debounceTimer.current);
    };
  }, [workflowId, nodes, edges, options, save]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current)
        window.clearTimeout(debounceTimer.current);
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
    };
  }, []);

  return { saveNow: save };
}
