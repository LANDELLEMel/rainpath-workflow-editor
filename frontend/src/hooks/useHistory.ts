import { useCallback, useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';

export interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 30;

/**
 * Simple undo stack for nodes + edges.
 * Uses a ref for the stack (synchronous reads) and a version counter
 * so `canUndo` triggers re-renders when the stack changes.
 */
export function useHistory() {
  const stackRef = useRef<HistoryEntry[]>([]);
  const [version, setVersion] = useState(0);

  /** Snapshot current state before a mutation. */
  const pushState = useCallback((nodes: Node[], edges: Edge[]) => {
    stackRef.current = [
      ...stackRef.current.slice(-(MAX_HISTORY - 1)),
      {
        nodes: JSON.parse(JSON.stringify(nodes)) as Node[],
        edges: JSON.parse(JSON.stringify(edges)) as Edge[],
      },
    ];
    setVersion((v) => v + 1);
  }, []);

  /** Restore the most recent snapshot. Returns the entry or null. */
  const undo = useCallback((): HistoryEntry | null => {
    const stack = stackRef.current;
    if (stack.length === 0) return null;
    const entry = stack[stack.length - 1];
    stackRef.current = stack.slice(0, -1);
    setVersion((v) => v + 1);
    return entry;
  }, []);

  /** Reset history (e.g. when switching workflows). */
  const reset = useCallback(() => {
    stackRef.current = [];
    setVersion((v) => v + 1);
  }, []);

  // Suppress unused-var lint — version drives reactivity for canUndo
  void version;
  const canUndo = stackRef.current.length > 0;

  return { pushState, undo, canUndo, reset };
}
