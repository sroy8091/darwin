
import React, { useRef } from 'react';
import { ElementType } from '../types';
import { ELEMENT_CONFIG } from '../constants';

const PaletteItem: React.FC<{ type: ElementType }> = ({ type }) => {
  const config = ELEMENT_CONFIG[type];
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const dragStarted = useRef(false);

  const onDragStart = (event: React.DragEvent, elementType: ElementType) => {
    event.dataTransfer.setData('application/hld-builder/element-type', elementType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStarted.current = true;
    const touch = e.touches[0];
    
    // Create ghost element for visual feedback
    const originalElement = e.currentTarget as HTMLDivElement;
    const ghost = originalElement.cloneNode(true) as HTMLDivElement;
    ghost.style.position = 'fixed';
    ghost.style.zIndex = '1000';
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '0.8';
    ghost.style.transform = 'scale(1.05)';
    ghost.style.left = `${touch.clientX - ghost.offsetWidth / 2}px`;
    ghost.style.top = `${touch.clientY - ghost.offsetHeight / 2}px`;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStarted.current || !ghostRef.current) return;
    
    // Prevent page scrolling while dragging
    e.preventDefault();

    const touch = e.touches[0];
    ghostRef.current.style.left = `${touch.clientX - ghostRef.current.offsetWidth / 2}px`;
    ghostRef.current.style.top = `${touch.clientY - ghostRef.current.offsetHeight / 2}px`;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragStarted.current) return;
    dragStarted.current = false;
    
    if (ghostRef.current) {
      const touch = e.changedTouches[0];
      // Hide the ghost so elementFromPoint finds what's underneath
      ghostRef.current.style.display = 'none';
      const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Dispatch a custom drop event on the element under the touch
      if (elementUnderTouch) {
          const dropEvent = new CustomEvent('hld-drop', {
              bubbles: true,
              cancelable: true,
              detail: {
                  type,
                  clientX: touch.clientX,
                  clientY: touch.clientY,
              }
          });
          elementUnderTouch.dispatchEvent(dropEvent);
      }
      
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
  };


  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`flex items-center p-3 mb-4 rounded-lg cursor-grab transition-all duration-200 ease-in-out border-2 ${config.color} ${config.textColor} hover:shadow-lg hover:scale-105 hover:shadow-cyan-400/50 active:cursor-grabbing`}
    >
      <div className="mr-3">{config.icon}</div>
      <span className="font-medium">{config.defaultName}</span>
    </div>
  );
};

export const Palette: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-100 p-6 border-r border-gray-200 shadow-xl flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-cyan-700">Components</h2>
      <p className="text-sm text-gray-600 mb-6">Drag components onto the canvas to start building your diagram.</p>
      <div className="flex-1 overflow-y-auto -mr-4 pr-4 custom-scrollbar">
        <PaletteItem type={ElementType.User} />
        <PaletteItem type={ElementType.WebClient} />
        <PaletteItem type={ElementType.MobileClient} />
        <PaletteItem type={ElementType.ApiGateway} />
        <PaletteItem type={ElementType.LoadBalancer} />
        <PaletteItem type={ElementType.Microservice} />
        <PaletteItem type={ElementType.MessageQueue} />
        <PaletteItem type={ElementType.Cache} />
        <PaletteItem type={ElementType.Database} />
        <PaletteItem type={ElementType.TextBox} />
        <PaletteItem type={ElementType.Custom} />
      </div>
    </aside>
  );
};
