// DXF Export utility for word clock grid
// Browser-safe: generates DXF as plain text and triggers download via Blob
// Uses vector font paths for precise rendering

import { ClockLayout } from '../types/layout';
import { getFont, extractGlyphPath, pathToDXFEntities, preloadFonts, createFallbackFont } from './fontPathExtractor';

// Create a letter grid from layout data (reusing logic from ClockDisplay.tsx)
function createLetterGrid(layout: ClockLayout): string[][] {
  const grid: string[][] = Array(layout.gridHeight)
    .fill(null)
    .map(() => Array(layout.gridWidth).fill(' '));
  
  // Place words in the grid
  layout.words.forEach((wordPos) => {
    const { word, startRow, startCol, direction } = wordPos as any;
    
    for (let i = 0; i < word.length; i++) {
      const row = direction === 'horizontal' ? startRow : startRow + i;
      const col = direction === 'horizontal' ? startCol + i : startCol;
      
      if (row >= 0 && row < layout.gridHeight && col >= 0 && col < layout.gridWidth) {
        grid[row][col] = word[i];
      }
    }
  });
  
  return grid;
}

// DXF export configuration
interface DXFConfig {
  letterSize: number;        // Height of letters in DXF units
  gridSpacing: number;       // Spacing between grid cells
  margin: number;            // Margin around the entire grid
  fontName: string;          // Font name for path extraction
  addBorder: boolean;        // Draw a border rectangle
  addGridLines: boolean;     // Draw grid lines
  useVectorPaths: boolean;   // Use vector font paths instead of text entities
}

const defaultConfig: DXFConfig = {
  letterSize: 10,
  gridSpacing: 12,
  margin: 20,
  fontName: 'Arial',
  addBorder: true,
  addGridLines: false,
  useVectorPaths: true,
};

// DXF builder for TEXT and LINES - compatible with Fusion 360 and AutoCAD
function buildDXF(entities: string[], styles: string[] = []): string {
  const header = [
    '0','SECTION',
    '2','HEADER',
    '9','$ACADVER', '1','AC1027', // R2013
    '9','$HANDSEED', '5','FFFF', // Handle seed
    '9','$MEASUREMENT', '70','0', // English units
    '9','$INSUNITS', '70','4', // Millimeters
    '0','ENDSEC',
    '0','SECTION',
    '2','TABLES',
    // LAYER table
    '0','TABLE','2','LAYER','70','1',
    '0','LAYER','2','0','70','0','6','CONTINUOUS','62','7',
    '0','ENDTAB',
    // STYLE table
    '0','TABLE','2','STYLE','70','1',
    '0','STYLE','2','STANDARD','70','0','40','0','41','1','50','0','71','0','42','0','3','txt','4','',
    // Additional styles
    ...styles,
    '0','ENDTAB',
    '0','ENDSEC',
    '0','SECTION','2','ENTITIES'
  ].join('\n');

  const footer = ['0','ENDSEC','0','EOF'].join('\n');
  return `${header}\n${entities.join('\n')}\n${footer}`;
}

function dxfText(x: number, y: number, height: number, text: string, style: string): string {
  return [
    '0','TEXT',
    '8','0',          // layer 0
    '10', x.toString(), // insertion point X
    '20', y.toString(), // insertion point Y
    '30','0',         // insertion point Z
    '40', height.toString(), // text height
    '1', text,        // text content
    '7', 'STANDARD',  // Always use STANDARD style for compatibility
    '72','1',         // horizontal alignment: centered (1)
    '73','2',         // vertical alignment: middle (2)
    '11', x.toString(), // alignment point X (center point)
    '21', y.toString(), // alignment point Y (center point)
    '31','0',         // alignment point Z
  ].join('\n');
}

function dxfLine(x1: number, y1: number, x2: number, y2: number): string {
  return [
    '0','LINE',
    '8','0',
    '10', x1.toString(), '20', y1.toString(), '30','0',
    '11', x2.toString(), '21', y2.toString(), '31','0'
  ].join('\n');
}

export async function exportGridToDXF(layout: ClockLayout, filename: string, config: Partial<DXFConfig> = {}): Promise<void> {
  const finalConfig = { ...defaultConfig, ...config };
  const grid = createLetterGrid(layout);

  const totalWidth = (layout.gridWidth * finalConfig.gridSpacing) + (2 * finalConfig.margin);
  const totalHeight = (layout.gridHeight * finalConfig.gridSpacing) + (2 * finalConfig.margin);

  const entities: string[] = [];

  // Optional grid lines
  if (finalConfig.addGridLines) {
    // Vertical lines
    for (let col = 0; col <= layout.gridWidth; col++) {
      const x = finalConfig.margin + (col * finalConfig.gridSpacing);
      entities.push(dxfLine(x, finalConfig.margin, x, totalHeight - finalConfig.margin));
    }
    // Horizontal lines
    for (let row = 0; row <= layout.gridHeight; row++) {
      const y = finalConfig.margin + (row * finalConfig.gridSpacing);
      entities.push(dxfLine(finalConfig.margin, y, totalWidth - finalConfig.margin, y));
    }
  }

  // Letters - use vector paths or text entities
  if (finalConfig.useVectorPaths) {
    try {
      console.log(`Attempting to load font: ${finalConfig.fontName}`);
      // Load the font for path extraction
      const font = await getFont(finalConfig.fontName);
      if (!font) {
        console.warn(`Font ${finalConfig.fontName} not available, using fallback font for vector paths`);
        console.log('Available fonts:', Object.keys(fontCache));
        // Use fallback font for vector paths instead of text entities
        const fallbackFont = createFallbackFont();
        await addVectorPaths(entities, grid, layout, finalConfig, totalHeight, fallbackFont);
      } else {
        console.log(`Successfully loaded font: ${finalConfig.fontName}`);
        // Use vector paths
        await addVectorPaths(entities, grid, layout, finalConfig, totalHeight, font);
      }
    } catch (error) {
      console.error('Error with vector paths, using fallback font:', error);
      const fallbackFont = createFallbackFont();
      await addVectorPaths(entities, grid, layout, finalConfig, totalHeight, fallbackFont);
    }
  } else {
    console.log('Using text entities (vector paths disabled)');
    // Use text entities
    await addTextEntities(entities, grid, layout, finalConfig, totalHeight);
  }

  // Border
  if (finalConfig.addBorder) {
    const x = finalConfig.margin;
    const y = finalConfig.margin;
    const w = totalWidth - (2 * finalConfig.margin);
    const h = totalHeight - (2 * finalConfig.margin);
    entities.push(dxfLine(x, y, x + w, y));
    entities.push(dxfLine(x + w, y, x + w, y + h));
    entities.push(dxfLine(x + w, y + h, x, y + h));
    entities.push(dxfLine(x, y + h, x, y));
  }

  const dxfContent = buildDXF(entities);

  // Trigger download in browser
  const blob = new Blob([dxfContent], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.dxf') ? filename : `${filename}.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Add letters as vector paths
async function addVectorPaths(
  entities: string[], 
  grid: string[][], 
  layout: ClockLayout, 
  config: DXFConfig, 
  totalHeight: number,
  font: any
): Promise<void> {
  for (let row = 0; row < layout.gridHeight; row++) {
    for (let col = 0; col < layout.gridWidth; col++) {
      const letter = grid[row][col];
      if (letter === ' ') continue;

      // Calculate position (centered in cell)
      // DXF uses bottom-left origin, so we need to flip Y to maintain correct row order
      const cx = config.margin + (col + 0.5) * config.gridSpacing;
      const cy = totalHeight - config.margin - (row + 0.5) * config.gridSpacing;

      // Extract glyph path
      const path = extractGlyphPath(font, letter, config.letterSize);
      if (path) {
        // Calculate glyph bounds to center it properly
        const bounds = path.getBoundingBox();
        const glyphWidth = bounds.x2 - bounds.x1;
        const glyphHeight = bounds.y2 - bounds.y1;
        
        // Center the glyph within the cell
        const offsetX = cx - (bounds.x1 + bounds.x2) / 2;
        const offsetY = cy - (bounds.y1 + bounds.y2) / 2;
        
        // Convert path to DXF entities with proper centering
        const pathEntities = pathToDXFEntities(path, offsetX, offsetY);
        entities.push(...pathEntities);
      } else {
        // Fallback to text entity if path extraction fails
        entities.push(dxfText(cx, cy, config.letterSize, letter, 'STANDARD'));
      }
    }
  }
}

// Add letters as text entities (fallback)
async function addTextEntities(
  entities: string[], 
  grid: string[][], 
  layout: ClockLayout, 
  config: DXFConfig, 
  totalHeight: number
): Promise<void> {
  for (let row = 0; row < layout.gridHeight; row++) {
    for (let col = 0; col < layout.gridWidth; col++) {
      const letter = grid[row][col];
      if (letter === ' ') continue;
      const cx = config.margin + (col + 0.5) * config.gridSpacing;
      const cy = totalHeight - config.margin - (row + 0.5) * config.gridSpacing;
      entities.push(dxfText(cx, cy, config.letterSize, letter, 'STANDARD'));
    }
  }
}

// Export function that can be called from React components
export async function downloadDXF(layout: ClockLayout, filename: string, config?: Partial<DXFConfig>): Promise<void> {
  const finalFilename = filename.endsWith('.dxf') ? filename : `${filename}.dxf`;
  await exportGridToDXF(layout, finalFilename, config);
}
