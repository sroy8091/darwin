import React from 'react';
import { Point } from '../types';

interface ConnectorLineProps {
    from: Point;
    to: Point;
}

/**
 * Renders a single SVG line.
 * Assumes it is rendered within an <svg> container that has a marker with id="arrowhead" in its <defs>.
 */
export const ConnectorLine: React.FC<ConnectorLineProps> = ({ from, to }) => {
    return (
        <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#0891b2"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
        />
    );
};
