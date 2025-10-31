import React, { useState, useEffect } from 'react';
import { getFont, extractGlyphPath, createFallbackFont } from '../utils/fontPathExtractor';
import { pathToSVGNoFlip } from '../utils/svgPathConverter';
import { FontSettings } from '../types/layout';

// Map CSS font families to font file names (same as DXFExport)
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

interface VectorLetterCellProps {
  letter: string;
  isActive: boolean;
  isEmpty: boolean;
  fontSettings: FontSettings;
  cellWidth: number; // mm
  cellHeight: number; // mm
  fontName?: string; // Optional mapped font name (will use fontSettings.family if not provided)
}

const VectorLetterCell: React.FC<VectorLetterCellProps> = ({
  letter,
  isActive,
  isEmpty,
  fontSettings,
  cellWidth,
  cellHeight,
  fontName: providedFontName
}) => {
  const fontName = providedFontName || mapFontFamilyToFontName(fontSettings.family);
  const [svgPath, setSvgPath] = useState<string>('');

  useEffect(() => {
    if (isEmpty || letter === ' ') {
      setSvgPath('');
      return;
    }

    async function loadAndConvert() {
      try {
        // Load font
        const font = await getFont(fontName);
        const workingFont = font || createFallbackFont();

        // Calculate target letter height (same logic as DXF export)
        const marginPct = Math.max(0, Math.min(0.49, fontSettings.letterPaddingPercent ?? 0.1));
        const targetHeight = cellHeight * (1 - 2 * marginPct);

        // Measure glyph at reference size to determine scale (same logic as DXF export)
        const measurePath = extractGlyphPath(workingFont, letter, 1000);
        if (measurePath) {
          try {
            const mbox = (measurePath as any).getBoundingBox();
            const mheight = Math.max(0.0001, (mbox.y2 - mbox.y1));
            const fontSizeForTarget = (targetHeight * 1000) / mheight;

            const path = extractGlyphPath(workingFont, letter, fontSizeForTarget);
            if (!path) throw new Error('Failed to build scaled glyph path');

            // Calculate glyph bounds to center it properly
            const bounds = (path as any).getBoundingBox();
            
            // Use cell center
            const cx = cellWidth / 2;
            const cy = cellHeight / 2;
            
            // Center horizontally
            const offsetX = cx - (bounds.x1 + bounds.x2) / 2;
            
            // For SVG: no Y-flip, direct positioning with inverted Y offset
            // SVG Y increases downward, OpenType Y increases upward
            // To position glyph center at cy from top: offsetY = cy - glyphCenterY
            // But OpenType Y increases upward, so we need to invert
            const offsetY = cy + (bounds.y1 + bounds.y2) / 2;
            
            // Convert to SVG path WITHOUT Y flipping - let CSS handle the coordinate system
            const svgPathData = pathToSVGNoFlip(path, offsetX, offsetY);
            
            // Debug: Log the calculations
            const glyphCenterY = (bounds.y1 + bounds.y2) / 2;
            console.log(`${letter}: cellHeight=${cellHeight.toFixed(2)}, targetHeight=${targetHeight.toFixed(2)}, mheight=${mheight.toFixed(2)}, fontSize=${fontSizeForTarget.toFixed(2)}, bounds=(${bounds.x1.toFixed(2)},${bounds.y1.toFixed(2)})-(${bounds.x2.toFixed(2)},${bounds.y2.toFixed(2)}), boundsHeight=${(bounds.y2-bounds.y1).toFixed(2)}, glyphCenterY=${glyphCenterY.toFixed(2)}, cy=${cy.toFixed(2)}, offsetY=${offsetY.toFixed(2)}`);
            
            setSvgPath(svgPathData);
          } catch (error) {
            console.warn(`Error processing glyph for '${letter}':`, error);
            setSvgPath('');
          }
        }
      } catch (error) {
        console.warn(`Error rendering letter '${letter}':`, error);
        setSvgPath('');
      }
    }

    loadAndConvert();
  }, [letter, isEmpty, fontName, cellWidth, cellHeight, fontSettings.letterPaddingPercent]);

  if (isEmpty || letter === ' ') {
    return (
      <span
        style={{
          width: `${cellWidth}mm`,
          height: `${cellHeight}mm`,
          display: 'inline-block',
        }}
      />
    );
  }

  return (
    <svg
      width={`${cellWidth}mm`}
      height={`${cellHeight}mm`}
      viewBox={`0 0 ${cellWidth} ${cellHeight}`}
      style={{
        display: 'block',
        overflow: 'visible',
        transform: 'scaleY(-1)',
      }}
    >
      <path
        d={svgPath}
        fill={isActive ? '#ffffff' : '#6b7280'}
        stroke="none"
        className="transition-all duration-300"
      />
    </svg>
  );
};

export default VectorLetterCell;

