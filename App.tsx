
import React, { useState, useRef, useEffect } from 'react';
import { Palette } from './components/Palette';
import { Canvas } from './components/Canvas';
import { ElementData, ConnectorData } from './types';
import { ELEMENT_DIMENSIONS } from './constants';

// For TypeScript, declare the global library loaded from the script tag in index.html
declare const htmlToImage: any;

function App() {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Close the export menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const downloadFile = (filename: string, dataUrl: string) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
  };

  const handleExportImage = async (format: 'png' | 'jpeg') => {
    setIsExportMenuOpen(false);
    const node = canvasContentRef.current;
    if (!node || elements.length === 0) {
        alert('Canvas is empty. Add some elements to export.');
        return;
    }

    const { toPng, toJpeg } = htmlToImage;
    const exporter = format === 'png' ? toPng : toJpeg;
    const PADDING = 50;

    // Calculate bounding box of all elements, considering custom sizes
    const minX = Math.min(...elements.map(el => el.x));
    const minY = Math.min(...elements.map(el => el.y));
    const maxX = Math.max(...elements.map(el => el.x + (el.width || ELEMENT_DIMENSIONS.width)));
    const maxY = Math.max(...elements.map(el => el.y + (el.height || ELEMENT_DIMENSIONS.height)));

    const width = maxX - minX + PADDING * 2;
    const height = maxY - minY + PADDING * 2;
    
    // Temporarily apply a new transform to capture the entire diagram
    const dataUrl = await exporter(node, {
        width,
        height,
        style: {
            transform: `translate(${-minX + PADDING}px, ${-minY + PADDING}px) scale(1)`,
            top: '0',
            left: '0',
        },
        // Filter out the UI hints from the export
        filter: (element: HTMLElement) => !element.classList?.contains('export-ignore'),
    });

    downloadFile(`hld-diagram.${format}`, dataUrl);
  };
  
  return (
    <div className="flex flex-col h-screen font-sans bg-white text-gray-800">
        <header className="p-4 bg-white border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
             <div className="w-24"></div> {/* Left spacer */}
            <h1 className="text-2xl font-bold text-center text-cyan-700">Darwin</h1>
            <div className="relative w-24 flex justify-end" ref={exportMenuRef}>
                 <button 
                     onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                     className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                 >
                    Export
                 </button>
                 {isExportMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                         <a onClick={() => handleExportImage('png')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">as PNG</a>
                         <a onClick={() => handleExportImage('jpeg')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">as JPEG</a>
                     </div>
                 )}
            </div>
        </header>
        <div className="flex flex-grow overflow-hidden">
            <Palette />
            <main className="flex-grow p-4 flex">
              <Canvas
                  ref={canvasContentRef}
                  elements={elements}
                  setElements={setElements}
                  connectors={connectors}
                  setConnectors={setConnectors}
              />
            </main>
        </div>
    </div>
  );
}

export default App;
