import React, { useState } from 'react';
import { ElementType } from '../types';
import { ELEMENT_CONFIG, ELEMENT_DIMENSIONS } from '../constants';
import { CloseIcon } from './Icons';

interface ComponentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectComponent: (type: ElementType) => void;
}

export const ComponentDrawer: React.FC<ComponentDrawerProps> = ({ isOpen, onClose, onSelectComponent }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleSelect = (type: ElementType) => {
        onSelectComponent(type);
        onClose();
    };

    const handleDragStart = (e: React.DragEvent, type: ElementType) => {
        e.dataTransfer.setData('application/hld-builder/element-type', type);
        e.dataTransfer.effectAllowed = 'move';
        
        const preview = document.getElementById(`drag-preview-${type}`);
        const config = ELEMENT_CONFIG[type as ElementType];
        const width = config.defaultWidth || ELEMENT_DIMENSIONS.width;
        const height = config.defaultHeight || ELEMENT_DIMENSIONS.height;

        if (preview) {
            e.dataTransfer.setDragImage(preview, width / 2, height / 2);
        }
        
        setTimeout(() => setIsDragging(true), 0);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <>
            {/* Hidden drag previews for a high-fidelity drag image */}
            <div style={{ position: 'absolute', top: -9999, left: -9999, zIndex: -1 }}>
                {Object.entries(ELEMENT_CONFIG).map(([type, config]) => {
                     const isTextBox = type === ElementType.TextBox;
                     const width = config.defaultWidth || ELEMENT_DIMENSIONS.width;
                     const height = config.defaultHeight || ELEMENT_DIMENSIONS.height;
                     return (
                         <div
                            id={`drag-preview-${type}`}
                            key={type}
                            className={`select-none rounded-lg shadow-md border-2 ${config.color} ${config.textColor}`}
                            style={{ width, height }}
                        >
                            <div className={`w-full h-full ${isTextBox ? 'p-2' : 'p-3 flex items-center'}`}>
                                {isTextBox ? (
                                    <div className="bg-transparent w-full h-full text-center outline-none resize-none flex items-center justify-center">
                                        {config.defaultName}
                                    </div>
                                ) : (
                                    <>
                                        <div className="mr-3">{config.icon}</div>
                                        <div className="flex-grow text-center">
                                            <span className="font-semibold break-words">{config.defaultName}</span>
                                        </div>
                                    </>
                                )}
                             </div>
                        </div>
                    );
                })}
            </div>

            {/* Overlay */}
            <div 
                onClick={onClose}
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-30 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'} ${isDragging ? '!bg-transparent pointer-events-none' : ''}`}
                aria-hidden="true"
            ></div>

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out z-40 w-full max-w-sm ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
            >
                <div className="flex flex-col h-full">
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
                        <h2 id="drawer-title" className="text-xl font-bold text-cyan-700">Add Component</h2>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" aria-label="Close">
                            <CloseIcon />
                        </button>
                    </header>
                    <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-2">
                            {Object.entries(ELEMENT_CONFIG).map(([type, config]) => (
                                <li key={type}>
                                    <button
                                        onClick={() => handleSelect(type as ElementType)}
                                        onDragStart={(e) => handleDragStart(e, type as ElementType)}
                                        onDragEnd={handleDragEnd}
                                        draggable="true"
                                        className="w-full text-left p-3 flex items-start space-x-4 border border-transparent rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <div className={`mt-1 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg ${config.color} ${config.textColor}`}>
                                            {config.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{config.defaultName}</h3>
                                            <p className="text-sm text-gray-600">{config.description}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};