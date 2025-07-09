
import React, { useState, useRef } from 'react';
import { ElementType } from '../types';
import { ELEMENT_CONFIG } from '../constants';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { ComponentDrawer } from './ComponentDrawer';

interface AddComponentButtonProps {
    onAddComponent: (type: ElementType) => void;
}

export const AddComponentButton: React.FC<AddComponentButtonProps> = ({ onAddComponent }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const dragInfoRef = useRef({ isDragging: false });
    const [dragPreview, setDragPreview] = useState<{ type: ElementType; x: number; y: number } | null>(null);


    const handleSelect = (type: ElementType) => {
        onAddComponent(type);
        setIsMenuOpen(false);
    };

    const handlePointerDown = (e: React.PointerEvent, type: ElementType) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        
        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);

        dragInfoRef.current.isDragging = false;
        const startX = e.clientX;
        const startY = e.clientY;

        const handlePointerMove = (moveEvent: PointerEvent) => {
            if (dragInfoRef.current.isDragging) {
                setDragPreview(p => (p ? { ...p, x: moveEvent.clientX, y: moveEvent.clientY } : null));
                return;
            }

            const dx = Math.abs(moveEvent.clientX - startX);
            const dy = Math.abs(moveEvent.clientY - startY);

            if (dx > 5 || dy > 5) {
                dragInfoRef.current.isDragging = true;
                setDragPreview({ type, x: moveEvent.clientX, y: moveEvent.clientY });
                setTimeout(() => setIsMenuOpen(false), 0);
            }
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
            target.releasePointerCapture(upEvent.pointerId);
            target.removeEventListener('pointermove', handlePointerMove);
            target.removeEventListener('pointerup', handlePointerUp);
            target.removeEventListener('pointercancel', handlePointerUp);

            setDragPreview(null);

            if (dragInfoRef.current.isDragging) {
                const canvasEl = document.querySelector('.flex-grow.relative.bg-gray-50');
                if (canvasEl) {
                    const dropEvent = new CustomEvent('hld-drop', {
                        detail: {
                            type: type,
                            clientX: upEvent.clientX,
                            clientY: upEvent.clientY,
                        },
                    });
                    canvasEl.dispatchEvent(dropEvent);
                }
            }
        };

        target.addEventListener('pointermove', handlePointerMove);
        target.addEventListener('pointerup', handlePointerUp);
        target.addEventListener('pointercancel', handlePointerUp);
    };

    const AnimatedIcon = () => (
        <div 
            className="w-8 h-8 flex items-center justify-center transition-transform duration-50 ease-in-out"
            style={{ transform: `rotate(${isMenuOpen ? '45deg' : '0deg'})` }}
        >
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </div>
    );

    if (isDesktop) {
        return (
            <>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-16 h-16 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 transition-colors duration-300 ease-in-out"
                    aria-label={isMenuOpen ? 'Close menu' : 'Add component'}
                >
                    <AnimatedIcon />
                </button>
                <ComponentDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onSelectComponent={handleSelect}
                />
            </>
        );
    }

    // Mobile: Radial Menu
    const availableElements = Object.entries(ELEMENT_CONFIG);
    const ringConfig = [
        { radius: 90, itemCount: 4 },
        { radius: 160, itemCount: 5 },
        { radius: 230, itemCount: 6 },
    ];
    const ANGLE_RANGE_DEG = 90;
    const START_ANGLE_OFFSET = 10;
    const END_ANGLE_OFFSET = 10;
    let elementCursor = 0;

    return (
        <>
            <div className="relative z-40">
                {ringConfig.map((ring) => {
                    const itemsForThisRing = availableElements.slice(elementCursor, elementCursor + ring.itemCount);
                    const numElementsInThisRing = itemsForThisRing.length;
                    elementCursor += numElementsInThisRing;

                    if (numElementsInThisRing === 0) return null;

                    return itemsForThisRing.map(([type, config], indexInRing) => {
                        const EFFECTIVE_ANGLE_RANGE = ANGLE_RANGE_DEG - START_ANGLE_OFFSET - END_ANGLE_OFFSET;
                        const angle = (numElementsInThisRing === 1)
                            ? START_ANGLE_OFFSET + EFFECTIVE_ANGLE_RANGE / 2
                            : START_ANGLE_OFFSET + (EFFECTIVE_ANGLE_RANGE / (numElementsInThisRing - 1)) * indexInRing;

                        const x = ring.radius * Math.cos(angle * Math.PI / 180);
                        const y = ring.radius * Math.sin(angle * Math.PI / 180);
                        
                        const globalElementIndex = elementCursor - numElementsInThisRing + indexInRing;
                        const totalDelay = (globalElementIndex * 25);

                        return (
                            <div
                                key={type}
                                className="group absolute bottom-2 left-2 z-10 hover:z-20"
                                style={{
                                    transition: `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s`,
                                    transitionDelay: isMenuOpen ? `${totalDelay}ms` : '0ms',
                                    transform: isMenuOpen ? `translate(${x}px, ${-y}px) scale(1)` : 'translate(0, 0) scale(0.5)',
                                    opacity: isMenuOpen ? 1 : 0,
                                    pointerEvents: isMenuOpen ? 'auto' : 'none',
                                }}
                            >
                                <button
                                    onPointerDown={(e) => handlePointerDown(e, type as ElementType)}
                                    onClick={() => {
                                        if (!dragInfoRef.current.isDragging) {
                                            handleSelect(type as ElementType);
                                        }
                                    }}
                                    onDragStart={(e) => e.preventDefault()}
                                    style={{ touchAction: 'none' }}
                                    className={`w-12 h-12 flex items-center justify-center rounded-full ${config.color} ${config.textColor} shadow-lg hover:scale-110 transition-transform`}
                                    aria-label={`Add ${config.defaultName}`}
                                >
                                    {config.icon}
                                </button>
                                <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {config.defaultName}
                                </span>
                            </div>
                        );
                    });
                })}

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-16 h-16 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 transition-colors duration-300 ease-in-out relative z-30"
                    aria-label={isMenuOpen ? 'Close menu' : 'Add component'}
                >
                   <AnimatedIcon />
                </button>
            </div>
            {dragPreview && (
                 <div
                    className="fixed top-0 left-0 pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                        left: dragPreview.x,
                        top: dragPreview.y,
                    }}
                >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full shadow-xl animate-pulse ${ELEMENT_CONFIG[dragPreview.type].color} ${ELEMENT_CONFIG[dragPreview.type].textColor}`}>
                       {ELEMENT_CONFIG[dragPreview.type].icon}
                    </div>
                </div>
            )}
        </>
    );
};
