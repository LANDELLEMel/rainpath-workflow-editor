import type { WorkflowNode } from '../types/workflow';

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 88;
export const HORIZONTAL_GAP = 120;
export const VERTICAL_GAP = 80;

export const COLUMN_STRIDE = NODE_WIDTH + HORIZONTAL_GAP;
export const ROW_STRIDE = NODE_HEIGHT + VERTICAL_GAP;

export interface GridPosition {
  gridCol: number;
  gridRow: number;
  positionX: number;
  positionY: number;
}

export function calculateNodePosition(
  col: number,
  row: number,
): GridPosition {
  return {
    gridCol: col,
    gridRow: row,
    positionX: col * COLUMN_STRIDE,
    positionY: row * ROW_STRIDE,
  };
}

export type GridDirection = 'right' | 'down';

export function getNextAvailablePosition(
  nodes: WorkflowNode[],
  direction: GridDirection,
  referenceNodeId?: string,
): GridPosition {
  if (nodes.length === 0) {
    return calculateNodePosition(0, 0);
  }

  const reference = referenceNodeId
    ? nodes.find((n) => n.id === referenceNodeId)
    : undefined;

  const occupied = new Set(
    nodes.map((n) => `${n.gridCol}:${n.gridRow}`),
  );

  if (direction === 'right') {
    const baseRow = reference?.gridRow ?? 0;
    const startCol = reference
      ? reference.gridCol + 1
      : Math.max(...nodes.map((n) => n.gridCol)) + 1;
    let col = startCol;
    while (occupied.has(`${col}:${baseRow}`)) {
      col += 1;
    }
    return calculateNodePosition(col, baseRow);
  }

  const baseCol = reference?.gridCol ?? 0;
  const startRow = reference
    ? reference.gridRow + 1
    : Math.max(
        ...nodes
          .filter((n) => n.gridCol === baseCol)
          .map((n) => n.gridRow),
        -1,
      ) + 1;
  let row = startRow;
  while (occupied.has(`${baseCol}:${row}`)) {
    row += 1;
  }
  return calculateNodePosition(baseCol, row);
}

export function getGridBounds(nodes: WorkflowNode[]): {
  cols: number;
  rows: number;
} {
  if (nodes.length === 0) return { cols: 1, rows: 1 };
  return {
    cols: Math.max(...nodes.map((n) => n.gridCol)) + 1,
    rows: Math.max(...nodes.map((n) => n.gridRow)) + 1,
  };
}
