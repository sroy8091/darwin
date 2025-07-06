import React, { useState, useCallback, useEffect, useRef, forwardRef } from 'react';
import { ElementData, ConnectorData, ElementType, Point } from '../types';
import { ELEMENT_CONFIG, ELEMENT_DIMENSIONS } from '../constants';
import { Element } from './Element';
import { ConnectorLine } from './ConnectorLine';

interface CanvasProps {
    elements: ElementData[];
    setElements: React.Dispatch<React.SetStateAction<ElementData[]>>;
    connectors: ConnectorData[];
    setConnectors: React.Dispatch<React.SetStateAction<ConnectorData[]>>;
}

interface Transform {
    x: number;
    y: number;
    scale: number;
}

interface DraggingElementInfo {
    id: string;
    initialElementPos: Point;
    initialMousePos: Point; // In screen space
}

interface ResizingElementInfo {
    id: string;
    initialSize: { width: number; height: number };
    initialMousePos: Point; // In screen space
}

const getAttachmentPoint = (el: ElementData, targetCenter: Point): Point => {
    const w = el.width || ELEMENT_DIMENSIONS.width;
    const h = el.height || ELEMENT_DIMENSIONS.height;
    const elCenter = { x: el.x + w / 2, y: el.y + h / 2 };

    const dx = targetCenter.x - elCenter.x;
    const dy = targetCenter.y - elCenter.y;

    if (dx === 0 && dy === 0) return {x: el.x + w/2, y: el.y + h/2};

    const tanA = Math.abs(dy / dx);
    const tanB = h / w;

    if (tanA < tanB) { // Intersects left or right side
        return dx > 0 ? { x: el.x + w, y: elCenter.y } : { x: el.x, y: elCenter.y };
    } else { // Intersects top or bottom side
        return dy > 0 ? { x: elCenter.x, y: el.y + h } : { x: elCenter.x, y: el.y };
    }
};

const CanvasComponent: React.ForwardRefRenderFunction<HTMLDivElement, CanvasProps> = (
    { elements, setElements, connectors, setConnectors },
    ref
) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [draggingElement, setDraggingElement] = useState<DraggingElementInfo | null>(null);
    const [resizingElement, setResizingElement] = useState<ResizingElementInfo | null>(null);
    const [connecting, setConnecting] = useState<{ fromId: string; toPoint: Point; } | null>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const lastMousePosition = useRef<Point>({ x: 0, y: 0 });

    const screenToWorld = useCallback((screenX: number, screenY: number): Point => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const worldX = (screenX - rect.left - transform.x) / transform.scale;
        const worldY = (screenY - rect.top - transform.y) / transform.scale;
        return { x: worldX, y: worldY };
    }, [transform]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const currentMousePosition = { x: e.clientX, y: e.clientY };

        if (isPanning) {
            const dx = currentMousePosition.x - lastMousePosition.current.x;
            const dy = currentMousePosition.y - lastMousePosition.current.y;
            setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
        } else if (draggingElement) {
            const dx = (currentMousePosition.x - draggingElement.initialMousePos.x) / transform.scale;
            const dy = (currentMousePosition.y - draggingElement.initialMousePos.y) / transform.scale;
            
            const newX = draggingElement.initialElementPos.x + dx;
            const newY = draggingElement.initialElementPos.y + dy;
            
            setElements(prev => prev.map(el => el.id === draggingElement.id ? { ...el, x: newX, y: newY } : el));
        } else if (resizingElement) {
            const dx = (currentMousePosition.x - resizingElement.initialMousePos.x) / transform.scale;
            const dy = (currentMousePosition.y - resizingElement.initialMousePos.y) / transform.scale;
            
            const newWidth = Math.max(80, resizingElement.initialSize.width + dx);
            const newHeight = Math.max(40, resizingElement.initialSize.height + dy);
            
            setElements(prev => prev.map(el => el.id === resizingElement.id ? { ...el, width: newWidth, height: newHeight } : el));
        }
        else if (connecting) {
            setConnecting(c => c ? { ...c, toPoint: screenToWorld(e.clientX, e.clientY) } : null);
        }

        lastMousePosition.current = currentMousePosition;
    }, [isPanning, draggingElement, resizingElement, connecting, transform.scale, setElements, screenToWorld]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (connecting) {
            const targetElement = (e.target as HTMLElement).closest('[data-element-id]');
            if (targetElement) {
                const toId = targetElement.getAttribute('data-element-id');
                if (toId && toId !== connecting.fromId) {
                    const newConnector: ConnectorData = { id: `conn_${Date.now()}`, from: connecting.fromId, to: toId };
                    const alreadyExists = connectors.some(conn => (conn.from === newConnector.from && conn.to === newConnector.to));
                    if (!alreadyExists) {
                        setConnectors(prev => [...prev, newConnector]);
                    }
                }
            }
        }
        
        setIsPanning(false);
        setDraggingElement(null);
        setResizingElement(null);
        setConnecting(null);
    }, [connecting, connectors, setConnectors]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setSelectedElementId(null);
        }
        
        if (e.target !== e.currentTarget) return; 
        if (e.button === 0 || e.button === 1) {
            e.preventDefault();
            e.stopPropagation();
            setIsPanning(true);
            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    };
    
    useEffect(() => {
        const moveHandler = (e: MouseEvent) => handleMouseMove(e);
        const upHandler = (e: MouseEvent) => handleMouseUp(e);
        
        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);
        
        return () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', upHandler);
        };
    }, [handleMouseMove, handleMouseUp]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
                // Do not delete if an input/textarea is focused
                if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                    return;
                }
                setElements(prev => prev.filter(el => el.id !== selectedElementId));
                setConnectors(prev => prev.filter(conn => conn.from !== selectedElementId && conn.to !== selectedElementId));
                setSelectedElementId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedElementId, setElements, setConnectors]);


    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 1.03;
        const newScale = e.deltaY < 0 ? transform.scale * zoomFactor : transform.scale / zoomFactor;
        const clampedScale = Math.max(0.2, Math.min(newScale, 3));

        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        
        const newX = mousePos.x - (mousePos.x - transform.x) * (clampedScale / transform.scale);
        const newY = mousePos.y - (mousePos.y - transform.y) * (clampedScale / transform.scale);
        
        setTransform({ x: newX, y: newY, scale: clampedScale });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/hld-builder/element-type') as ElementType;
        if (type && canvasRef.current) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            const config = ELEMENT_CONFIG[type];
            const newElement: ElementData = {
                id: `el_${Date.now()}`,
                type,
                name: config.defaultName,
                x: worldPos.x - (config.defaultWidth || ELEMENT_DIMENSIONS.width) / 2,
                y: worldPos.y - (config.defaultHeight || ELEMENT_DIMENSIONS.height) / 2,
            };
            if(config.defaultWidth) newElement.width = config.defaultWidth;
            if(config.defaultHeight) newElement.height = config.defaultHeight;

            setElements(prev => [...prev, newElement]);
            setSelectedElementId(newElement.id);
        }
    };
    
    const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); 
        setSelectedElementId(id);
        
        const element = elements.find(el => el.id === id);
        if (!element || e.button !== 0) return;

        // Check for resize handle click
        const target = e.target as HTMLElement;
        if (target.dataset.resizeHandle) {
             setResizingElement({
                id,
                initialSize: { width: element.width || ELEMENT_CONFIG[element.type].defaultWidth || ELEMENT_DIMENSIONS.width, height: element.height || ELEMENT_CONFIG[element.type].defaultHeight || ELEMENT_DIMENSIONS.height },
                initialMousePos: { x: e.clientX, y: e.clientY },
            });
        } else { // It's a drag
            setDraggingElement({
                id,
                initialElementPos: { x: element.x, y: element.y },
                initialMousePos: { x: e.clientX, y: e.clientY },
            });
        }
    };

    const handleRename = useCallback((id: string, newName: string) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, name: newName } : el));
    }, [setElements]);

    const handleStartConnection = useCallback((fromId: string) => {
        const fromEl = elements.find(el => el.id === fromId);
        if (fromEl) {
            const w = fromEl.width || ELEMENT_DIMENSIONS.width;
            const h = fromEl.height || ELEMENT_DIMENSIONS.height;
            const center = { x: fromEl.x + w / 2, y: fromEl.y + h / 2 };
            setConnecting({ fromId, toPoint: center });
        }
    }, [elements]);

    const getCursor = () => {
        if (isPanning) return 'grabbing';
        if (draggingElement) return 'grabbing';
        if (resizingElement) return 'se-resize';
        if (connecting) return 'crosshair';
        return 'grab';
    }

    return (
        <div 
            ref={canvasRef}
            className="flex-grow relative bg-gray-50 rounded-lg shadow-inner overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            style={{ 
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.1) 1px, transparent 0)', 
                backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
                backgroundPosition: `${transform.x}px ${transform.y}px`,
                cursor: getCursor()
            }}
        >
            <div
                ref={ref}
                className="absolute top-0 left-0"
                style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}
            >
                <svg
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        overflow: 'visible',
                        pointerEvents: 'none',
                    }}
                >
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="5"
                            markerHeight="3.5"
                            refX="5"
                            refY="1.75"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <polygon points="0 0, 5 1.75, 0 3.5" fill="#0891b2" />
                        </marker>
                    </defs>
                    <g>
                        {connectors.map(conn => {
                            const fromEl = elements.find(el => el.id === conn.from);
                            const toEl = elements.find(el => el.id === conn.to);
                            if (!fromEl || !toEl) return null;
                            
                            const toCenter = { x: toEl.x + (toEl.width || ELEMENT_DIMENSIONS.width) / 2, y: toEl.y + (toEl.height || ELEMENT_DIMENSIONS.height) / 2 };
                            const fromCenter = { x: fromEl.x + (fromEl.width || ELEMENT_DIMENSIONS.width) / 2, y: fromEl.y + (fromEl.height || ELEMENT_DIMENSIONS.height) / 2 };
                            
                            const startPoint = getAttachmentPoint(fromEl, toCenter);
                            const endPoint = getAttachmentPoint(toEl, fromCenter);
                            
                            return <ConnectorLine key={conn.id} from={startPoint} to={endPoint} />;
                        })}

                        {connecting && elements.find(el => el.id === connecting.fromId) && (
                             <ConnectorLine 
                                from={getAttachmentPoint(elements.find(el => el.id === connecting.fromId)!, connecting.toPoint)} 
                                to={connecting.toPoint} 
                            />
                        )}
                    </g>
                </svg>

                {elements.map(el => (
                    <Element
                        key={el.id}
                        data={el}
                        onRename={handleRename}
                        onStartConnection={handleStartConnection}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        isSelected={el.id === selectedElementId}
                    />
                ))}
            </div>
             <div className="absolute bottom-4 right-4 bg-gray-800 text-white text-xs rounded px-3 py-2 opacity-80 shadow-lg pointer-events-none export-ignore">
                <p><b>Scroll:</b> Zoom</p>
                <p><b>Click & Drag Canvas:</b> Pan</p>
                <p><b>Click Element + Delete:</b> Remove</p>
            </div>
        </div>
    );
};

export const Canvas = forwardRef(CanvasComponent);