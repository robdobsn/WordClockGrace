import React from 'react';
import { FontSettings } from '../types/layout';

interface FontControlsProps {
  fontSettings: FontSettings;
  onFontChange: (settings: FontSettings) => void;
}

const FontControls: React.FC<FontControlsProps> = ({ fontSettings, onFontChange }) => {
  const fontFamilies = [
    { value: 'Monaco, Menlo, Ubuntu Mono, monospace', label: 'Monaco (Monospace)' },
    { value: 'Inter, system-ui, sans-serif', label: 'Inter (Sans-serif)' },
    { value: 'Georgia, serif', label: 'Georgia (Serif)' },
    { value: 'Arial, sans-serif', label: 'Arial (Sans-serif)' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica (Sans-serif)' },
    { value: 'Times New Roman, serif', label: 'Times New Roman (Serif)' },
    { value: 'Courier New, monospace', label: 'Courier New (Monospace)' },
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

  const handleChange = (property: keyof FontSettings, value: string | number) => {
    onFontChange({
      ...fontSettings,
      [property]: value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Font Settings</h3>
      
      <div className="space-y-4">
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

        {/* Line Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Line Height: {fontSettings.lineHeight.toFixed(1)}
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleChange('lineHeight', Math.max(0.8, fontSettings.lineHeight - 0.1))}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            >
              -
            </button>
            <input
              type="range"
              min="0.8"
              max="3.0"
              step="0.1"
              value={fontSettings.lineHeight}
              onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => handleChange('lineHeight', Math.min(3.0, fontSettings.lineHeight + 0.1))}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            >
              +
            </button>
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
              lineHeight: fontSettings.lineHeight,
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

