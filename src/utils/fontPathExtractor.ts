// Font path extraction utility using OpenType.js
// Converts font glyphs to vector paths for precise DXF rendering

import * as opentype from 'opentype.js';

// Cache for loaded fonts
const fontCache = new Map<string, opentype.Font>();

// Font loading configuration
interface FontConfig {
  name: string;
  url: string;
  fallback?: string;
}

// Dynamic font configurations - loaded from public/fonts at runtime
const fontConfigs: FontConfig[] = [
  {
    name: 'Monaco',
    url: '/fonts/Monaco.ttf',
    fallback: 'Monaco, Menlo, Ubuntu Mono, monospace'
  },
  {
    name: 'Arial',
    url: '/fonts/arial.ttf',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Ruler Stencil Regular',
    url: '/fonts/Ruler Stencil Regular.ttf',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Ruler Stencil Bold',
    url: '/fonts/Ruler Stencil Bold.ttf',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Ruler Stencil Heavy',
    url: '/fonts/Ruler Stencil Heavy.ttf',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Ruler Stencil Light',
    url: '/fonts/Ruler Stencil Light.ttf',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Ruler Stencil Thin',
    url: '/fonts/Ruler Stencil Thin.ttf',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Warzone Stencil',
    url: '/fonts/Warzone Stencil.ttf',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Lazer Game Zone',
    url: '/fonts/Lazer Game Zone.ttf',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Octin Stencil Rg',
    url: '/fonts/octin stencil rg.ttf',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Ombudsman Alternate',
    url: '/fonts/OmbudsmanAlternate-6YvDq.otf',
    fallback: 'Arial, sans-serif'
  }
];

// Load a font from URL or cache
export async function loadFont(fontName: string): Promise<opentype.Font | null> {
  // Check cache first
  if (fontCache.has(fontName)) {
    return fontCache.get(fontName)!;
  }

  // Find font configuration
  const config = fontConfigs.find(f => f.name === fontName);
  if (!config) {
    console.warn(`Font configuration not found for: ${fontName}`);
    return null;
  }

  try {
    // Add cache-busting parameter to avoid browser cache issues
    const urlWithCacheBust = `${config.url}?v=${Date.now()}`;
    console.log(`Loading font ${fontName} from: ${urlWithCacheBust}`);
    // Load font from URL
    const font = await opentype.load(urlWithCacheBust);
    console.log(`Successfully loaded font: ${fontName}`);
    fontCache.set(fontName, font);
    return font;
  } catch (error) {
    console.error(`Failed to load font ${fontName} from ${config.url}:`, error);
    console.log('Error details:', error.message);
    
    // Try to load a fallback font
    if (fontName !== 'Arial') {
      console.log('Trying Arial as fallback...');
      return await loadFont('Arial');
    }
    
    return null;
  }
}

// Get font from cache or load it
export async function getFont(fontName: string): Promise<opentype.Font | null> {
  if (fontCache.has(fontName)) {
    return fontCache.get(fontName)!;
  }
  return await loadFont(fontName);
}

// Create a simple fallback font for testing when no fonts are available
export function createFallbackFont(): any {
  return {
    charToGlyph: (char: string) => {
      // Create simple rectangular glyphs for testing
      const glyph = {
        getPath: (x: number, y: number, fontSize: number) => {
          const width = fontSize * 0.6;
          const height = fontSize * 0.8;
          // Add a small notch to distinguish from real fonts
          const commands = [
            { type: 'M', x: x, y: y },
            { type: 'L', x: x + width, y: y },
            { type: 'L', x: x + width, y: y + height },
            { type: 'L', x: x, y: y + height },
            { type: 'L', x: x, y: y + height * 0.3 },
            { type: 'L', x: x + width * 0.2, y: y + height * 0.3 },
            { type: 'L', x: x + width * 0.2, y: y },
            { type: 'Z' }
          ];
          return { commands };
        }
      };
      return glyph;
    }
  };
}

// Extract glyph path for a character
export function extractGlyphPath(font: opentype.Font, char: string, fontSize: number): opentype.Path | null {
  try {
    const glyph = font.charToGlyph(char);
    if (!glyph) {
      console.warn(`Glyph not found for character: ${char}`);
      return null;
    }

    // Get the path for this glyph
    const path = glyph.getPath(0, 0, fontSize);
    return path;
  } catch (error) {
    console.error(`Error extracting glyph path for '${char}':`, error);
    return null;
  }
}

// Convert OpenType path to DXF entities as closed polylines for laser cutting
export function pathToDXFEntities(path: opentype.Path, offsetX: number, offsetY: number): string[] {
  const entities: string[] = [];
  
  // OpenType paths have commands array
  if (!path.commands || path.commands.length === 0) {
    return entities;
  }

  // Get the font size to determine the flip factor
  const fontSize = 10; // Default font size for flipping calculation

  // Group commands into separate paths (for letters with holes like 'O', 'A', etc.)
  const pathGroups: Array<Array<{type: string, x: number, y: number, x1?: number, y1?: number, x2?: number, y2?: number}>> = [];
  let currentPath: Array<{type: string, x: number, y: number, x1?: number, y1?: number, x2?: number, y2?: number}> = [];

  for (const command of path.commands) {
    if (command.type === 'M' && currentPath.length > 0) {
      // Start of new path
      pathGroups.push([...currentPath]);
      currentPath = [];
    }
    currentPath.push(command);
  }
  if (currentPath.length > 0) {
    pathGroups.push(currentPath);
  }

  // Convert each path group to a closed polyline
  for (const pathGroup of pathGroups) {
    if (pathGroup.length === 0) continue;
    
    const polylinePoints: Array<{x: number, y: number}> = [];
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    for (const command of pathGroup) {
      switch (command.type) {
        case 'M': // MoveTo
          currentX = command.x + offsetX;
          currentY = -command.y + offsetY; // Flip Y coordinate for DXF
          startX = currentX;
          startY = currentY;
          polylinePoints.push({ x: currentX, y: currentY });
          break;

        case 'L': // LineTo
          currentX = command.x + offsetX;
          currentY = -command.y + offsetY; // Flip Y coordinate for DXF
          polylinePoints.push({ x: currentX, y: currentY });
          break;

        case 'C': // CurveTo (cubic bezier)
          const cp1X = command.x1! + offsetX;
          const cp1Y = -command.y1! + offsetY; // Flip Y coordinate for DXF
          const cp2X = command.x2! + offsetX;
          const cp2Y = -command.y2! + offsetY; // Flip Y coordinate for DXF
          const endX = command.x + offsetX;
          const endY = -command.y + offsetY; // Flip Y coordinate for DXF
          
          // Convert cubic bezier to points
          const bezierPoints = cubicBezierToPoints(
            currentX, currentY,
            cp1X, cp1Y,
            cp2X, cp2Y,
            endX, endY,
            12 // More segments for smoother curves
          );
          
          // Add all points except the first (already added)
          for (let i = 1; i < bezierPoints.length; i++) {
            polylinePoints.push(bezierPoints[i]);
          }
          
          currentX = endX;
          currentY = endY;
          break;

        case 'Q': // Quadratic curve
          const qcpX = command.x1! + offsetX;
          const qcpY = -command.y1! + offsetY; // Flip Y coordinate for DXF
          const qendX = command.x + offsetX;
          const qendY = -command.y + offsetY; // Flip Y coordinate for DXF
          
          // Convert quadratic bezier to points
          const quadPoints = quadraticBezierToPoints(
            currentX, currentY,
            qcpX, qcpY,
            qendX, qendY,
            8
          );
          
          // Add all points except the first (already added)
          for (let i = 1; i < quadPoints.length; i++) {
            polylinePoints.push(quadPoints[i]);
          }
          
          currentX = qendX;
          currentY = qendY;
          break;

        case 'Z': // ClosePath
          // Ensure the path is closed by adding the start point if needed
          if (polylinePoints.length > 0) {
            const lastPoint = polylinePoints[polylinePoints.length - 1];
            const firstPoint = polylinePoints[0];
            const distance = Math.sqrt(
              Math.pow(lastPoint.x - firstPoint.x, 2) + 
              Math.pow(lastPoint.y - firstPoint.y, 2)
            );
            if (distance > 0.1) { // Only add if not already closed
              polylinePoints.push({ x: firstPoint.x, y: firstPoint.y });
            }
          }
          break;
      }
    }

    // Create closed polyline from the points
    if (polylinePoints.length >= 2) {
      entities.push(createDXFPolyline(polylinePoints, true)); // true = closed
    }
  }

  return entities;
}

// Helper function to create DXF LINE entity
function createDXFLine(x1: number, y1: number, x2: number, y2: number): string {
  return [
    '0', 'LINE',
    '8', '0', // layer
    '10', x1.toString(), '20', y1.toString(), '30', '0',
    '11', x2.toString(), '21', y2.toString(), '31', '0'
  ].join('\n');
}

// Helper function to create DXF LWPOLYLINE entity (closed polyline for letter outlines)
function createDXFPolyline(points: Array<{x: number, y: number}>, closed: boolean): string {
  const entity: string[] = [
    '0', 'LWPOLYLINE',
    '8', '0', // layer
    '70', closed ? '1' : '0', // closed flag
    '90', points.length.toString() // number of vertices
  ];

  // Add vertex coordinates
  for (const point of points) {
    entity.push('10', point.x.toString());
    entity.push('20', point.y.toString());
  }

  return entity.join('\n');
}

// Convert cubic bezier curve to points
function cubicBezierToPoints(
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  x4: number, y4: number,
  segments: number
): Array<{x: number, y: number}> {
  const points: Array<{x: number, y: number}> = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    const x = uuu * x1 + 3 * uu * t * x2 + 3 * u * tt * x3 + ttt * x4;
    const y = uuu * y1 + 3 * uu * t * y2 + 3 * u * tt * y3 + ttt * y4;
    
    points.push({ x, y });
  }
  
  return points;
}

// Convert quadratic bezier curve to points
function quadraticBezierToPoints(
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  segments: number
): Array<{x: number, y: number}> {
  const points: Array<{x: number, y: number}> = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;
    
    const x = u * u * x1 + 2 * u * t * x2 + t * t * x3;
    const y = u * u * y1 + 2 * u * t * y2 + t * t * y3;
    
    points.push({ x, y });
  }
  
  return points;
}

// Get available font names
export function getAvailableFonts(): string[] {
  return fontConfigs.map(config => config.name);
}

// Function to add a custom font from the fonts folder
export function addCustomFont(fontName: string, fileName: string): void {
  // Check if font already exists
  const existingFont = fontConfigs.find(config => config.name === fontName);
  if (existingFont) {
    console.log(`Font ${fontName} already exists`);
    return;
  }
  
  // Add new font configuration
  const newFont: FontConfig = {
    name: fontName,
    url: `/fonts/${fileName}`,
    fallback: `${fontName}, Arial, sans-serif`
  };
  
  fontConfigs.push(newFont);
  console.log(`Added custom font: ${fontName} from ${fileName}`);
}

// Function to dynamically discover fonts from public/fonts directory
export async function discoverFonts(): Promise<string[]> {
  try {
    // Try to fetch a manifest or list of available fonts
    // For now, we'll return the predefined list since we can't easily scan the directory from the browser
    const discoveredFonts = fontConfigs.map(config => config.name);
    console.log('Discovered fonts:', discoveredFonts);
    return discoveredFonts;
  } catch (error) {
    console.error('Error discovering fonts:', error);
    return ['Monaco', 'Arial']; // Fallback to basic fonts
  }
}

// Preload common fonts
export async function preloadFonts(): Promise<void> {
  // Clear cache to ensure fresh font loading
  fontCache.clear();
  const commonFonts = ['Monaco', 'Arial'];
  await Promise.all(commonFonts.map(fontName => loadFont(fontName)));
}
