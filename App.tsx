import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, CanvasHandle } from './components/Canvas';
import { ElementData, ConnectorData, DiagramData, ElementType } from './types';
import { ELEMENT_CONFIG, ELEMENT_DIMENSIONS } from './constants';
import { HamburgerIcon, TrashIcon, UndoIcon } from './components/Icons';
import { ExamplesModal } from './components/ExamplesModal';
import { AddComponentButton } from './components/AddComponentButton';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useHistory } from './hooks/useHistory';
import { toPng, toJpeg } from 'html-to-image';

export const App: React.FC = () => {
  const { 
    state: diagram, 
    set: setDiagram, 
    undo, 
    redo, 
    reset: resetDiagram,
    canUndo,
    canRedo
  } = useHistory<DiagramData>({ elements: [], connectors: [] });
  
  const { elements, connectors } = diagram;
  
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [selectedConnectorIds, setSelectedConnectorIds] = useState<string[]>([]); // NEW
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isExamplesModalOpen, setIsExamplesModalOpen] = useState(false);
  
  const canvasContentRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const canvasHandleRef = useRef<CanvasHandle>(null);
  const mainMenuRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
            setIsMainMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedElementIds.length === 0 && selectedConnectorIds.length === 0) return;

    setDiagram(currentDiagram => {
        const idsToDelete = new Set(selectedElementIds);
        const connectorIdsToDelete = new Set(selectedConnectorIds);
        const newElements = currentDiagram.elements.filter(el => !idsToDelete.has(el.id));
        const newConnectors = currentDiagram.connectors.filter(conn => 
            !idsToDelete.has(conn.from) && 
            !idsToDelete.has(conn.to) && 
            !connectorIdsToDelete.has(conn.id)
        );
        return { elements: newElements, connectors: newConnectors };
    });

    setSelectedElementIds([]);
    setSelectedConnectorIds([]);
  }, [selectedElementIds, selectedConnectorIds, setDiagram]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isUndo = (isMac ? e.metaKey : e.ctrlKey) && e.key === 'z' && !e.shiftKey;
      const isRedo = (isMac ? e.metaKey : e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey));

      if (isUndo) {
        e.preventDefault();
        if (canUndo) undo();
      } else if (isRedo) {
        e.preventDefault();
        if (canRedo) redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedElementIds.length > 0 || selectedConnectorIds.length > 0)) {
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo, selectedElementIds, selectedConnectorIds, handleDeleteSelected]);

  useEffect(() => {
    // This effect reconciles the selection state if the underlying elements change (e.g., after an undo/redo).
    if (selectedElementIds.length === 0) return;
    
    const elementIds = new Set(diagram.elements.map(el => el.id));
    const validSelectedIds = selectedElementIds.filter(id => elementIds.has(id));

    if (validSelectedIds.length !== selectedElementIds.length) {
        setSelectedElementIds(validSelectedIds);
    }
}, [diagram.elements, selectedElementIds]);

  const downloadFile = (filename: string, data: string, type: string, isDataUrl = false) => {
    if (isDataUrl) {
        // For image exports, use the data URL directly
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        // For JSON export, use Blob
        const blob = new Blob([data], { type });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }
};

  const handleExportImage = async (format: 'png' | 'jpeg') => {
    setIsMainMenuOpen(false);
    const node = canvasContentRef.current;
    if (!node || elements.length === 0) {
        console.warn('Canvas is empty. Add some elements to export.');
        return;
    }

    const exporter = format === 'png' ? toPng : toJpeg;
    const PADDING = 50;

    const getElWidth = (el: ElementData) => el.width || ELEMENT_CONFIG[el.type].defaultWidth || ELEMENT_DIMENSIONS.width;
    const getElHeight = (el: ElementData) => el.height || ELEMENT_CONFIG[el.type].defaultHeight || ELEMENT_DIMENSIONS.height;

    const minX = Math.min(...elements.map(el => el.x));
    const minY = Math.min(...elements.map(el => el.y));
    const maxX = Math.max(...elements.map(el => el.x + getElWidth(el)));
    const maxY = Math.max(...elements.map(el => el.y + getElHeight(el)));

    const width = maxX - minX + PADDING * 2;
    const height = maxY - minY + PADDING * 2;

    try {
        const dataUrl = await exporter(node, {
            width,
            height,
            style: {
                transform: `translate(${-minX + PADDING}px, ${-minY + PADDING}px) scale(1)`,
                top: '0',
                left: '0',
            },
            filter: (element: HTMLElement) => !element.classList?.contains('export-ignore'),
        });
        downloadFile(`hld-diagram.${format}`, dataUrl, `image/${format}`, true);
    } catch (err) {
        console.error('Failed to export image:', err);
    }
  };

  const handleExportJson = () => {
    setIsMainMenuOpen(false);
    if (elements.length === 0) {
        console.warn('Canvas is empty. Nothing to export.');
        return;
    }
    const diagramData: DiagramData = { elements, connectors };
    const jsonString = JSON.stringify(diagramData, null, 2);
    downloadFile('diagram.json', jsonString, 'application/json');
  };

  const loadDiagram = useCallback((data: any): boolean => {
    if (typeof data !== 'object' || data === null || !Array.isArray(data.elements) || !Array.isArray(data.connectors)) {
        console.error('Invalid file format. The file must be a JSON object with "elements" and "connectors" arrays.');
        return false;
    }
    const diagramData: DiagramData = data;

    resetDiagram(diagramData);
    setSelectedElementIds([]); // Clear selection when loading new diagram
    return true;
  }, [resetDiagram]);

  const handleImportJson = () => {
    setIsMainMenuOpen(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result;
                if (typeof content === 'string') {
                    const data = JSON.parse(content);
                    loadDiagram(data);
                }
            } catch (err) {
                console.error(`Error parsing JSON file: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        };
        reader.readAsText(file);
    };
    input.click();
  };
  
  const handleLoadExample = useCallback(async (path: string) => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch example: ${response.statusText}`);
      }
      const data = await response.json();
      if (!loadDiagram(data)) {
        throw new Error('Invalid diagram file format.');
      }
    } catch (err) {
      console.error(`Error loading example: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [loadDiagram]);

  const handleOpenExamples = () => {
    setIsMainMenuOpen(false);
    setIsExamplesModalOpen(true);
  };

  const handleAddComponent = useCallback((type: ElementType) => {
      canvasHandleRef.current?.addElementAtCenter(type);
  }, []);

  return (
    <div className="flex flex-col h-screen font-sans bg-white text-gray-800">
        <style>{`
            @keyframes delete-button-pop-in {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-delete-button-pop-in {
                animation: delete-button-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
        `}</style>
        <header className="p-4 bg-white border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
             <div className="w-24"></div>
            <h1 className="text-2xl font-bold text-center text-cyan-700">Darwin</h1>
            <div className="relative w-24 flex justify-end" ref={mainMenuRef}>
                 <button 
                     onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
                     className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                     aria-label="Main Menu"
                 >
                    <HamburgerIcon />
                 </button>
                 {isMainMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-20">
                         <div className="px-4 py-2 text-sm font-semibold text-gray-500">Export</div>
                         <a onClick={() => handleExportImage('png')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">as PNG</a>
                         <a onClick={() => handleExportImage('jpeg')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">as JPEG</a>
                         <a onClick={handleExportJson} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">as JSON</a>
                         <div className="border-t my-1 mx-2 border-gray-200"></div>
                         <a onClick={handleImportJson} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Import from JSON...</a>
                         <div className="border-t my-1 mx-2 border-gray-200"></div>
                         <a onClick={handleOpenExamples} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Load Example...</a>
                     </div>
                 )}
            </div>
        </header>
        <div className="flex flex-grow overflow-hidden relative">
            <main className="flex-grow p-4 flex">
              <Canvas
                  key={diagram.elements[0]?.id || 1}
                  ref={canvasHandleRef}
                  exportRef={canvasContentRef}
                  diagram={diagram}
                  setDiagram={setDiagram}
                  selectedElementIds={selectedElementIds}
                  setSelectedElementIds={setSelectedElementIds}
                  selectedConnectorIds={selectedConnectorIds} // NEW
                  setSelectedConnectorIds={setSelectedConnectorIds} // NEW
              />
            </main>

            {/* Action buttons container */}
            <div className="fixed bottom-8 left-8 z-30 flex items-end gap-4">
                {/* A stack for Undo and Add buttons */}
                <div className="flex flex-col-reverse items-center gap-4">
                    <AddComponentButton onAddComponent={handleAddComponent} />
                    {/* Undo Button */}
                    {isMobile && canUndo && (
                        <button
                            onClick={undo}
                            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 transition-all duration-300 ease-in-out transform hover:scale-110 motion-safe:animate-delete-button-pop-in"
                            aria-label="Undo last action"
                        >
                            <UndoIcon />
                        </button>
                    )}
                </div>
                
                {/* Delete Button appears next to the Add/Undo stack on mobile when items are selected */}
                {isMobile && (selectedElementIds.length > 0 || selectedConnectorIds.length > 0) && (
                    <button
                        onClick={handleDeleteSelected}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 transition-all duration-300 ease-in-out transform hover:scale-110 motion-safe:animate-delete-button-pop-in"
                        aria-label="Delete selected components or connectors"
                    >
                        <TrashIcon />
                    </button>
                )}
            </div>
        </div>
        <ExamplesModal 
          isOpen={isExamplesModalOpen}
          onClose={() => setIsExamplesModalOpen(false)}
          onSelectExample={handleLoadExample}
        />
    </div>
  );
}