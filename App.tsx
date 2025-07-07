
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, CanvasHandle } from './components/Canvas';
import { ElementData, ConnectorData, DiagramData, ElementType } from './types';
import { ELEMENT_CONFIG, ELEMENT_DIMENSIONS } from './constants';
import { HamburgerIcon } from './components/Icons';
import { ExamplesModal } from './components/ExamplesModal';
import { AddComponentButton } from './components/AddComponentButton';

declare const htmlToImage: any;

function App() {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isExamplesModalOpen, setIsExamplesModalOpen] = useState(false);
  const [canvasKey, setCanvasKey] = useState(Date.now());
  
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const canvasHandleRef = useRef<CanvasHandle>(null);
  const mainMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
            setIsMainMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const downloadFile = (filename: string, data: string, type: string) => {
      const blob = new Blob([data], { type });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
  };

  const handleExportImage = async (format: 'png' | 'jpeg') => {
    setIsMainMenuOpen(false);
    const node = canvasContentRef.current;
    if (!node || elements.length === 0) {
        console.warn('Canvas is empty. Add some elements to export.');
        return;
    }

    const { toPng, toJpeg } = htmlToImage;
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

    downloadFile(`hld-diagram.${format}`, dataUrl, `image/${format}`);
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

  const loadDiagram = (data: any): boolean => {
    if (typeof data !== 'object' || data === null || !Array.isArray(data.elements) || !Array.isArray(data.connectors)) {
        console.error('Invalid file format. The file must be a JSON object with "elements" and "connectors" arrays.');
        return false;
    }
    const diagram: DiagramData = data;

    console.log("Loading diagram. Imported element positions:", diagram.elements.map(el => ({ id: el.id, x: el.x, y: el.y })));

    setElements(diagram.elements);
    setConnectors(diagram.connectors);
    setCanvasKey(Date.now());
    return true;
  }

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
  
  const handleLoadExample = async (path: string) => {
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
  };

  const handleOpenExamples = () => {
    setIsMainMenuOpen(false);
    setIsExamplesModalOpen(true);
  };

  const handleAddComponent = (type: ElementType) => {
      canvasHandleRef.current?.addElementAtCenter(type);
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-white text-gray-800">
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
                  key={canvasKey}
                  ref={canvasHandleRef}
                  exportRef={canvasContentRef}
                  elements={elements}
                  setElements={setElements}
                  connectors={connectors}
                  setConnectors={setConnectors}
              />
            </main>
            <AddComponentButton onAddComponent={handleAddComponent} />
        </div>
        <ExamplesModal 
          isOpen={isExamplesModalOpen}
          onClose={() => setIsExamplesModalOpen(false)}
          onSelectExample={handleLoadExample}
        />
    </div>
  );
}

export default App;
