
import React from 'react';
import { ElementType } from '../types';
import { ELEMENT_CONFIG } from '../constants';

const PaletteItem: React.FC<{ type: ElementType }> = ({ type }) => {
  const config = ELEMENT_CONFIG[type];

  const onDragStart = (event: React.DragEvent, elementType: ElementType) => {
    event.dataTransfer.setData('application/hld-builder/element-type', elementType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      className={`flex items-center p-3 mb-4 rounded-lg cursor-grab transition-all duration-200 ease-in-out border-2 ${config.color} ${config.textColor} hover:shadow-lg hover:scale-105 hover:shadow-cyan-400/50`}
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