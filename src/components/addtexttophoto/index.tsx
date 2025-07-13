'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isSelected: boolean;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  opacity?: number;
}

export default function AddTextToPhoto() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [fontSize] = useState(32);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily] = useState('Arial');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [imageScale, setImageScale] = useState({ scaleX: 1, scaleY: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Impact',
    'Comic Sans MS'
  ];

  // 计算图片缩放比例
  useEffect(() => {
    if (selectedImage && imageContainerRef.current) {
      const img = new window.Image();
      img.onload = () => {
        const container = imageContainerRef.current;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const scaleX = img.width / containerRect.width;
          const scaleY = img.height / containerRect.height;
          setImageScale({ scaleX, scaleY });
        }
      };
      img.src = selectedImage;
    }
  }, [selectedImage]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setTextElements([]);
        setSelectedTextId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const addText = () => {
    if (textInput.trim()) {
      const newText: TextElement = {
        id: Date.now().toString(),
        text: textInput,
        x: 100,
        y: 100,
        fontSize,
        color: textColor,
        fontFamily,
        isSelected: false
      };
      setTextElements([...textElements, newText]);
      setTextInput('');
    }
  };

  const selectText = (id: string) => {
    setSelectedTextId(id);
    setTextElements(textElements.map(text => ({
      ...text,
      isSelected: text.id === id
    })));
  };

  const updateTextPosition = (id: string, x: number, y: number) => {
    setTextElements(textElements.map(text =>
      text.id === id ? { ...text, x, y } : text
    ));
  };

  const updateTextProperty = (id: string, property: keyof TextElement, value: TextElement[keyof TextElement]) => {
    setTextElements(textElements.map(text =>
      text.id === id ? { ...text, [property]: value } : text
    ));
  };

  const deleteText = (id: string) => {
    setTextElements(textElements.filter(text => text.id !== id));
    setSelectedTextId(null);
  };

  // 改进的拖拽处理
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setIsDragging(true);
    selectText(elementId);
    
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (rect) {
      const element = textElements.find(el => el.id === elementId);
      if (element) {
        setDragOffset({
          x: e.clientX - rect.left - element.x,
          y: e.clientY - rect.top - element.y
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedTextId || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    updateTextPosition(selectedTextId, x, y);
  }, [isDragging, selectedTextId, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const downloadImage = useCallback(() => {
    if (!canvasRef.current || !selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Draw text elements with proper scaling and styling
      textElements.forEach(element => {
        // 计算实际位置（考虑缩放）
        const actualX = element.x * imageScale.scaleX;
        const actualY = element.y * imageScale.scaleY;
        const actualFontSize = element.fontSize * imageScale.scaleX;
        
        // 设置字体样式
        let fontStyle = '';
        if (element.italic) fontStyle += 'italic ';
        if (element.bold) fontStyle += 'bold ';
        fontStyle += `${actualFontSize}px ${element.fontFamily}`;
        
        ctx.font = fontStyle;
        ctx.fillStyle = element.color;
        ctx.globalAlpha = element.opacity ?? 1;
        
        // 设置文本对齐
        ctx.textAlign = element.align || 'left';
        
        // 绘制文本
        ctx.fillText(element.text, actualX, actualY);
        
        // 绘制下划线
        if (element.underline) {
          const metrics = ctx.measureText(element.text);
          const underlineY = actualY + 2;
          ctx.strokeStyle = element.color;
          ctx.lineWidth = Math.max(1, actualFontSize / 20);
          ctx.beginPath();
          ctx.moveTo(actualX, underlineY);
          ctx.lineTo(actualX + metrics.width, underlineY);
          ctx.stroke();
        }
        
        // 重置透明度
        ctx.globalAlpha = 1;
      });

      // Download
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = selectedImage;
  }, [selectedImage, textElements, imageScale]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Add Text to Photo</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Tools */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Text Tools</h2>
              
              {/* Add Text */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-black">Add New Text</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text..."
                    className="flex-1 px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addText}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Text Properties */}
              {selectedTextId && (
                <div className="space-y-4 border-t pt-4">
                  {/* Font Size */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Font Size</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="8"
                        max="120"
                        value={textElements.find(t => t.id === selectedTextId)?.fontSize ?? 32}
                        onChange={(e) => updateTextProperty(selectedTextId, 'fontSize', Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {textElements.find(t => t.id === selectedTextId)?.fontSize ?? 32}px
                      </span>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Font Family</h3>
                    <select
                      value={textElements.find(t => t.id === selectedTextId)?.fontFamily ?? 'Arial'}
                      onChange={(e) => updateTextProperty(selectedTextId, 'fontFamily', e.target.value)}
                      className="w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h3 className="text-sm font-medium text-gray-700">Text Color</h3>
                  <div className="flex space-x-3">
                    {['#000', '#fff', '#f44336', '#2196f3', '#4caf50', '#ffc107', '#a259ff', '#e75480'].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                          ${textColor === color ? 'border-black' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setTextColor(color);
                          if (selectedTextId) updateTextProperty(selectedTextId, 'color', color);
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* 自定义颜色选择器 */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-black">Custom Color:</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          setTextColor(newColor);
                          if (selectedTextId) updateTextProperty(selectedTextId, 'color', newColor);
                        }}
                        className="w-8 h-8 border text-black border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          setTextColor(newColor);
                          if (selectedTextId) updateTextProperty(selectedTextId, 'color', newColor);
                        }}
                        placeholder="#000000"
                        className="flex-1 px-2 py-1 text-xs border text-black border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* 颜色条 */}
                  <div className="h-8 rounded border mt-2" style={{ background: textColor }} />

                  {/* Text Alignment */}
                  <h3 className="text-sm font-medium text-black mt-4">Text Alignment</h3>
                  <div className="flex space-x-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        className={`w-10 h-10 border rounded flex items-center justify-center text-black 
                          ${textElements.find(t => t.id === selectedTextId)?.align === align ? 'border-pink-600' : 'text-black'}`}
                        onClick={() => updateTextProperty(selectedTextId, 'align', align)}
                      >
                        {align === 'left' && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zm0 4H3v2h12v-2z"/>
                          </svg>
                        )}
                        {align === 'center' && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 15h10v2H7v-2zm0-8h10v2H7V7zm0 4h10v2H7v-2z"/>
                          </svg>
                        )}
                        {align === 'right' && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 15h12v2H3v-2zm0-8h12v2H3V7zm0 4h12v2H3v-2z"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Text Style */}
                  <h3 className="text-sm font-medium text-black mt-4">Text Style</h3>
                  <div className="flex space-x-2">
                    <button
                      className={`w-10 h-10 border rounded  text-black font-bold ${textElements.find(t => t.id === selectedTextId)?.bold ? 'border-pink-600' : 'text-black'}`}
                      onClick={() => updateTextProperty(selectedTextId, 'bold', !textElements.find(t => t.id === selectedTextId)?.bold)}
                    >B</button>
                    <button
                      className={`w-10 h-10 border text-black rounded italic ${textElements.find(t => t.id === selectedTextId)?.italic ? 'border-pink-600' : 'text-black'}`}
                      onClick={() => updateTextProperty(selectedTextId, 'italic', !textElements.find(t => t.id === selectedTextId)?.italic)}
                    >I</button>
                    <button
                      className={`w-10 h-10 border  text-black rounded underline ${textElements.find(t => t.id === selectedTextId)?.underline ? 'border-pink-600' : 'text-black'}`}
                      onClick={() => updateTextProperty(selectedTextId, 'underline', !textElements.find(t => t.id === selectedTextId)?.underline)}
                    >U</button>
                  </div>

                  {/* Opacity */}
                  <h3 className="text-sm font-medium text-gray-700 mt-4">Opacity</h3>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.01"
                    value={textElements.find(t => t.id === selectedTextId)?.opacity ?? 1}
                    onChange={e => updateTextProperty(selectedTextId, 'opacity', Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span>100%</span>
                    <span>{Math.round((textElements.find(t => t.id === selectedTextId)?.opacity ?? 1) * 100)}%</span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteText(selectedTextId)}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center mt-4"
                  >
                    <span className="material-icons mr-2">delete</span> Delete Text
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center Panel - Image Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Image Editor</h2>
                {selectedImage && (
                  <button
                    onClick={downloadImage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Download Image
                  </button>
                )}
              </div>

              <div className="relative border-2 border-dashed border-gray-300 rounded-lg min-h-[400px] flex items-center justify-center">
                {selectedImage ? (
                  <div ref={imageContainerRef} className="relative inline-block">
                    <img
                      src={selectedImage}
                      alt="Uploaded"
                      className="max-w-full max-h-[600px] object-contain"
                    />
                    {textElements.map((element) => (
                      <div
                        key={element.id}
                        className={`absolute cursor-move select-none ${
                          element.isSelected ? 'ring-2 ring-blue-500' : ''
                        }`}
                        style={{
                          left: element.x,
                          top: element.y,
                          fontSize: element.fontSize,
                          color: element.color,
                          fontFamily: element.fontFamily,
                          textAlign: element.align,
                          fontWeight: element.bold ? 'bold' : 'normal',
                          fontStyle: element.italic ? 'italic' : 'normal',
                          textDecoration: element.underline ? 'underline' : 'none',
                          opacity: element.opacity,
                          userSelect: 'none',
                          pointerEvents: 'auto'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, element.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectText(element.id);
                        }}
                      >
                        {element.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-gray-600">Click &quot;Upload Image&quot; to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Text Elements List */}
        {textElements.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Elements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {textElements.map((element) => (
                <div
                  key={element.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    element.isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectText(element.id)}
                >
                  <p className="font-medium text-sm text-gray-900 truncate">{element.text}</p>
                  <p className="text-xs text-gray-500">
                    {element.fontFamily} • {element.fontSize}px
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden Canvas for Download */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
