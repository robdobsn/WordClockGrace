import React, { useState } from 'react';
import { ClockLayout, FontSettings } from '../types/layout';
import { downloadDXF } from '../utils/dxfExporter';

interface DXFExportProps {
  layout: ClockLayout;
  fontSettings: FontSettings;
}

// Map CSS font families to font file names
function mapFontFamilyToFontName(fontFamily: string): string {
  const fontMap: { [key: string]: string } = {
    'Monaco, Menlo, Ubuntu Mono, monospace': 'Monaco',
    'Arial, sans-serif': 'Arial',
    'Ruler Stencil Regular, Arial, sans-serif': 'Ruler Stencil Regular',
    'Ruler Stencil Bold, Arial, sans-serif': 'Ruler Stencil Bold',
    'Ruler Stencil Heavy, Arial, sans-serif': 'Ruler Stencil Heavy',
    'Ruler Stencil Light, Arial, sans-serif': 'Ruler Stencil Light',
    'Ruler Stencil Thin, Arial, sans-serif': 'Ruler Stencil Thin',
    'Warzone Stencil, Arial, sans-serif': 'Warzone Stencil',
    'Lazer Game Zone, Arial, sans-serif': 'Lazer Game Zone',
    'Octin Stencil Rg, Arial, sans-serif': 'Octin Stencil Rg',
    'Ombudsman Alternate, Arial, sans-serif': 'Ombudsman Alternate',
  };
  
  return fontMap[fontFamily] || 'Arial';
}

const DXFExport: React.FC<DXFExportProps> = ({ layout, fontSettings }) => {
  const [filename, setFilename] = useState('wordclock-grid');
  const [isExporting, setIsExporting] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async () => {
    if (!filename.trim()) {
      showToast('Please enter a filename', 'error');
      return;
    }

    setIsExporting(true);
    
    try {
      // Convert fontSettings to DXF config format
      const config = {
        letterSize: fontSettings.size,
        gridSpacing: fontSettings.cellSpacingX, // X (mm)
        gridSpacingY: fontSettings.cellSpacingY, // Y (mm)
        margin: fontSettings.margin,
        letterPaddingPercent: fontSettings.letterPaddingPercent,
        fontName: mapFontFamilyToFontName(fontSettings.family),
        useVectorPaths: fontSettings.useVectorPaths,
        addBorder: fontSettings.addBorder,
        addGridLines: fontSettings.addGridLines,
        testMode: testMode
      };

      await downloadDXF(layout, filename, config);
      // Show success message (non-blocking toast)
      showToast(`DXF file "${filename}.dxf" downloaded`,'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Error exporting DXF file. Please try again.','error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border relative">
      {toast && (
        <div
          role="status"
          className={`absolute right-3 top-3 px-3 py-2 rounded text-sm shadow transition-opacity ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Export to DXF</h3>
      
      <div className="space-y-4">
            {/* Filename input */}
            <div>
              <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-1">
                Filename
              </label>
              <input
                id="filename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter filename (without .dxf extension)"
              />
            </div>

            {/* Test Mode Toggle */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  Test Mode (Single Letter "A")
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {testMode 
                  ? "Will create a single letter 'A' as vector path for testing DXF structure" 
                  : "Will create the full word clock grid with vector font paths"
                }
              </p>
            </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={isExporting || !filename.trim()}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isExporting || !filename.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isExporting ? 'Exporting...' : 'Export DXF'}
        </button>

        {/* Info text */}
        <p className="text-xs text-gray-500">
          This will export the current grid layout as a DXF file for use in CAD programs like Fusion 360.
          <span className="block mt-1 text-gray-600">
            Font: {mapFontFamilyToFontName(fontSettings.family)} | 
            Letter margin: {(fontSettings.letterPaddingPercent*100).toFixed(2)}% per side | 
            Spacing: {fontSettings.cellSpacingX}×{fontSettings.cellSpacingY} mm
          </span>
          {fontSettings.useVectorPaths && (
            <span className="block mt-1 text-blue-600">
              ✓ Using vector font paths for precise laser cutting
            </span>
          )}
          {fontSettings.addBorder && (
            <span className="block mt-1 text-gray-600">
              ✓ Border will be included
            </span>
          )}
          {fontSettings.addGridLines && (
            <span className="block mt-1 text-gray-600">
              ✓ Grid lines will be included
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default DXFExport;
