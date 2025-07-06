
import React, { useState, useEffect, useRef } from 'react';
import { ElementData, ElementType } from '../types';
import { ELEMENT_CONFIG, ELEMENT_DIMENSIONS } from '../constants';

interface ElementProps {
  data: ElementData;
  onRename: (id: string, newName: string) => void;
  onStartConnection: (id: string) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export const Element: React.FC<ElementProps> = ({ data, onRename, onStartConnection, onMouseDown, isSelected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(data.name);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  const { type, id } = data;
  const config = ELEMENT_CONFIG[type];
  const isTextBox = type === ElementType.TextBox;

  // Auto-enter edit mode for new text boxes
  useEffect(() => {
    if (isTextBox && data.name === config.defaultName && isSelected) {
      setIsEditing(true);
    }
  }, [isSelected, isTextBox, data.name, config.defaultName]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setName(data.name);
  }, [data.name]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (name.trim() === '') {
        setName(data.name); // revert if empty
    } else {
        onRename(id, name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTextBox) {
      handleNameBlur();
    }
    if(e.key === 'Escape') {
      setIsEditing(false);
      setName(data.name);
    }
  };
  
  const selectionClasses = isSelected 
    ? 'ring-2 ring-cyan-500 shadow-xl' 
    : 'hover:shadow-xl hover:shadow-cyan-400/30';
    
  const width = data.width || ELEMENT_DIMENSIONS.width;
  const height = data.height || ELEMENT_DIMENSIONS.height;

  return (
    <div
      style={{
        left: data.x,
        top: data.y,
        width: width,
        height: height,
      }}
      className={`absolute select-none rounded-lg shadow-md border-2 transition-shadow duration-200 ${isTextBox ? 'cursor-text' : 'cursor-grab'} ${config.color} ${config.textColor} ${selectionClasses}`}
      onDoubleClick={handleDoubleClick}
      onMouseDown={onMouseDown}
      data-element-id={id}
    >
      <div 
        className={`w-full h-full ${isTextBox ? 'p-2' : 'p-3 flex items-center'}`}
        // Prevent pan when double-clicking to edit text.
        onMouseDown={(e) => { if(isEditing) e.stopPropagation() }}
      >
        {isTextBox ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            className="bg-transparent w-full h-full text-center outline-none resize-none"
            spellCheck="false"
            onMouseDown={(e) => e.stopPropagation()} // Prevent canvas pan when clicking text area
          />
        ) : (
          <>
            <div className="mr-3">{config.icon}</div>
            <div className="flex-grow text-center">
              {isEditing ? (
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent w-full text-center border-b border-dashed border-gray-400 outline-none"
                  onMouseDown={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="font-semibold break-words">{data.name}</span>
              )}
            </div>
          </>
        )}
      </div>

      <div 
        className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 rounded-full cursor-crosshair border-2 border-white hover:scale-125 transition-transform"
        onMouseDown={(e) => {
            e.stopPropagation();
            onStartConnection(id);
        }}
        title="Drag to connect"
      />

      {isSelected && (
        <div
          data-resize-handle="true"
          className="absolute bottom-[-8px] right-[-8px] w-4 h-4 bg-white border-2 border-cyan-500 rounded-full cursor-se-resize hover:bg-cyan-100"
        />
      )}
    </div>
  );
};
