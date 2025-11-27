import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';

const AnimatedFlowEdge = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetPosition,
        targetX,
        targetY,
    });

    const isFlowing = data?.isFlowing;

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {isFlowing && (
                <circle r="4" fill="var(--aqua)">
                    <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
                </circle>
            )}
        </>
    );
});

export default AnimatedFlowEdge;
