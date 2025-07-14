import React from 'react';
import { Point } from '../types';

interface ConnectorLineProps {
    from: Point;
    to: Point;
    isSelected?: boolean; // NEW
    onPointerDown?: (e: React.MouseEvent<SVGLineElement>) => void; // NEW
}

/**
 * Renders a single SVG line with arrowhead for direction.
 * Assumes it is rendered within an <svg> container that has a marker with id="arrowhead" in its <defs>.
 */
export const ConnectorLine: React.FC<ConnectorLineProps> = ({ from, to, isSelected = false, onPointerDown }) => {
    // Calculate angle for arrowhead rotation
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return (
        <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={isSelected ? "#ef4444" : "#0891b2"} // Red if selected
            strokeWidth={2} // Always 2, only color changes
            markerEnd="url(#arrowhead)" // Arrowhead marker for direction
            style={{ cursor: 'pointer', pointerEvents: 'all' }}
            onPointerDown={onPointerDown}
        />
    );
};
