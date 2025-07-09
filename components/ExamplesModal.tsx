
import React from 'react';
import { exampleMetas } from '../examples';
import { ExampleMeta } from '../types';
import { CloseIcon } from './Icons';

interface ExamplesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectExample: (path: string) => Promise<void>;
}

export const ExamplesModal: React.FC<ExamplesModalProps> = ({ isOpen, onClose, onSelectExample }) => {
    if (!isOpen) return null;

    const handleSelect = async (example: ExampleMeta) => {
        try {
            await onSelectExample(example.path);
            onClose();
        } catch (e) {
            // Error is handled by the onSelectExample implementation (logged to console).
            // We don't close the modal on failure so the user knows something went wrong.
            console.error("Failed to load example:", e);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={e => e.stopPropagation()}
                style={{
                    animationName: 'fade-in-scale-animation',
                    animationDuration: '0.2s',
                    animationFillMode: 'forwards'
                }}
            >
                <style>{`
                    @keyframes fade-in-scale-animation {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}</style>
                <header className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-cyan-700">Architecture Examples</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-gray-600 mb-6">Select a template to load it onto the canvas. This will replace your current work.</p>
                    <ul className="space-y-4">
                        {exampleMetas.map(example => (
                            <li key={example.name}>
                                <button 
                                    onClick={() => handleSelect(example)}
                                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-cyan-50 hover:border-cyan-400 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800">{example.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
