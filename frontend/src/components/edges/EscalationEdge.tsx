import { memo } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

function EscalationEdgeComponent(props: EdgeProps) {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
  } = props;
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  });

  return (
    <BaseEdge
      id={props.id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: '#D1D5DB',
        strokeWidth: 2,
        ...style,
      }}
    />
  );
}

export const EscalationEdge = memo(EscalationEdgeComponent);
