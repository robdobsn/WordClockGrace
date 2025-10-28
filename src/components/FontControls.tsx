import React from 'react';
import { FontSettings } from '../types/layout';

interface FontControlsProps {
  fontSettings: FontSettings;
  onFontChange: (settings: FontSettings) => void;
}

const FontControls: React.FC<FontControlsProps> = ({ fontSettings, onFontChange }) => {
  const fontFamilies = [
    { value: 'Monaco, Menlo, Ubuntu Mono, monospace', label: 'Monaco (Monospace)' },
    { value: 'Arial, sans-serif', label: 'Arial (Sans-serif)' },
    { value: 'Ruler Stencil Regular, Arial, sans-serif', label: 'Ruler Stencil Regular' },
    { value: 'Ruler Stencil Bold, Arial, sans-serif', label: 'Ruler Stencil Bold' },
    { value: 'Ruler Stencil Heavy, Arial, sans-serif', label: 'Ruler Stencil Heavy' },
    { value: 'Ruler Stencil Light, Arial, sans-serif', label: 'Ruler Stencil Light' },
    { value: 'Ruler Stencil Thin, Arial, sans-serif', label: 'Ruler Stencil Thin' },
    { value: 'Warzone Stencil, Arial, sans-serif', label: 'Warzone Stencil' },
    { value: 'Lazer Game Zone, Arial, sans-serif', label: 'Lazer Game Zone' },
    { value: 'Octin Stencil Rg, Arial, sans-serif', label: 'Octin Stencil Rg' },
    { value: 'Ombudsman Alternate, Arial, sans-serif', label: 'Ombudsman Alternate' },
  ];

  const fontWeights = [
    { value: '100', label: 'Thin' },
    { value: '200', label: 'Extra Light' },
    { value: '300', label: 'Light' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' },
  ];

  const handleChange = (property: keyof FontSettings, value: string | number | boolean) => {
    onFontChange({
      ...fontSettings,
      [property]: value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Font & Layout Settings</h3>
      
      <div className="space-y-6">
        {/* Font Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 border-b pb-2">Typography</h4>
          
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Family
            </label>
            <select
              value={fontSettings.family}
              onChange={(e) => handleChange('family', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {fontFamilies.map(font => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Weight
            </label>
            <select
              value={fontSettings.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {fontWeights.map(weight => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size: {fontSettings.size}px
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleChange('size', Math.max(8, fontSettings.size - 2))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                -
              </button>
              <input
                type="range"
                min="8"
                max="72"
                step="2"
                value={fontSettings.size}
                onChange={(e) => handleChange('size', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => handleChange('size', Math.min(72, fontSettings.size + 2))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Letter Spacing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Letter Spacing: {fontSettings.letterSpacing.toFixed(2)}em
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleChange('letterSpacing', Math.max(0, fontSettings.letterSpacing - 0.05))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                -
              </button>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={fontSettings.letterSpacing}
                onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => handleChange('letterSpacing', Math.min(0.5, fontSettings.letterSpacing + 0.05))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 border-b pb-2">Layout</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Cell Spacing X */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cell Spacing X: {fontSettings.cellSpacingX}px
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleChange('cellSpacingX', Math.max(5, fontSettings.cellSpacingX - 1))}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium"
                >
                  -
                </button>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={fontSettings.cellSpacingX}
                  onChange={(e) => handleChange('cellSpacingX', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => handleChange('cellSpacingX', Math.min(50, fontSettings.cellSpacingX + 1))}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cell Spacing Y */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cell Spacing Y: {fontSettings.cellSpacingY}px
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleChange('cellSpacingY', Math.max(5, fontSettings.cellSpacingY - 1))}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium"
                >
                  -
                </button>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={fontSettings.cellSpacingY}
                  onChange={(e) => handleChange('cellSpacingY', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => handleChange('cellSpacingY', Math.min(50, fontSettings.cellSpacingY + 1))}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Margin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margin: {fontSettings.margin}px
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleChange('margin', Math.max(0, fontSettings.margin - 5))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                -
              </button>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={fontSettings.margin}
                onChange={(e) => handleChange('margin', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => handleChange('margin', Math.min(100, fontSettings.margin + 5))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* DXF Export Options */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 border-b pb-2">DXF Export Options</h4>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={fontSettings.useVectorPaths}
                onChange={(e) => handleChange('useVectorPaths', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Use Vector Paths (Precise Font Rendering)</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={fontSettings.addBorder}
                onChange={(e) => handleChange('addBorder', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Add Border to DXF</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={fontSettings.addGridLines}
                onChange={(e) => handleChange('addGridLines', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Add Grid Lines to DXF</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
          <div 
            className="text-black bg-black p-2 rounded"
            style={{
              fontFamily: fontSettings.family,
              fontWeight: fontSettings.weight,
              fontSize: `${Math.min(fontSettings.size, 24)}px`,
              letterSpacing: `${fontSettings.letterSpacing}em`,
            }}
          >
            <span className="text-white">ELEVEN</span>
            <span className="text-gray-700">ABCDEF</span>
            <br />
            <span className="text-gray-700">GHIJKL</span>
            <span className="text-white">HUNDRED</span>
            <br />
            <span className="text-white">HOURS</span>
            <span className="text-gray-700">MNOPQR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontControls;

