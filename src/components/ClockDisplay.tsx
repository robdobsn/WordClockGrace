import React from 'react';
import { ClockLayout, FontSettings, WordPosition } from '../types/layout';
import { convertToMilitaryTime } from '../utils/militaryTime';
import { generateMilitaryCondensedGrid, generateCrosswordGrid, generateGraceGPTGrid, generateGraceGPT2Grid, generateAutoLayoutGrid } from '../utils/gridGenerator';

interface ClockDisplayProps {
  layout: ClockLayout;
  hours: number;
  minutes: number;
  fontSettings: FontSettings;
}

interface LetterGridProps {
  layout: ClockLayout;
  activeWords: string[];
  fontSettings: FontSettings;
}

interface CategorizedLetterGridProps {
  layout: ClockLayout;
  activeWordsWithCategory: Array<{word: string, category: 'hour' | 'minute' | 'military'}>;
  fontSettings: FontSettings;
}

function createLetterGrid(layout: ClockLayout): string[][] {
  // Use pre-generated grid for military-condensed layout
  if (layout.name === 'Military Condensed') {
    return generateMilitaryCondensedGrid();
  }
  
  // Use crossword grid generator for crossword layouts
  if (layout.name === 'Crossword One') {
    return generateCrosswordGrid(layout);
  }
  
  // Use GraceGPT grid generator for GraceGPT layout
  if (layout.name === 'GraceGPT') {
    return generateGraceGPTGrid();
  }
  
  // Use GraceGPT2 grid generator for GraceGPT2 layout
  if (layout.name === 'GraceGPT2') {
    return generateGraceGPT2Grid();
  }
  
  // For Auto Layout, Updated Layout, and Gracegpt4, use the JSON word positions if available
  if ((layout.name === 'Auto Layout' || layout.name === 'Updated Layout' || layout.name === 'Gracegpt4') && layout.words.length > 0) {
    // Use the word positions from the JSON layout
    const grid: string[][] = Array(layout.gridHeight)
      .fill(null)
      .map(() => Array(layout.gridWidth).fill(' '));
    
    // Place words in the grid using the JSON layout data
    layout.words.forEach((wordPos: any) => {
      const { word, startRow, startCol, direction } = wordPos;
      
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
  
  // Fallback to hardcoded grid for Auto Layout if no words data
  if (layout.name === 'Auto Layout' || layout.name === 'Updated Layout') {
    return generateAutoLayoutGrid();
  }
  
  // For Gracegpt4, if no words data, create empty grid
  if (layout.name === 'Gracegpt4') {
    return Array(layout.gridHeight || 11)
      .fill(null)
      .map(() => Array(layout.gridWidth || 11).fill(' '));
  }
  
  // Initialize grid with empty spaces for other layouts
  const grid: string[][] = Array(layout.gridHeight)
    .fill(null)
    .map(() => Array(layout.gridWidth).fill(' '));
  
  // Place words in the grid
  layout.words.forEach((wordPos: WordPosition) => {
    const { word, startRow, startCol, direction } = wordPos;
    
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

// Helper function to find words using category-based priority
function findWordWithCategoryPriority(layout: ClockLayout, word: string, preferredCategory: 'hour' | 'minute' | 'military' | 'connector'): Array<{row: number, col: number}> {
  // Find all instances of the word in the layout
  const wordInstances = layout.words.filter(w => w.word === word);
  
  if (wordInstances.length === 0) {
    return [];
  }
  
  // For minute category, prefer vertical direction among minute-categorized words
  if (preferredCategory === 'minute') {
    const minuteWords = wordInstances.filter(w => w.category === 'minute');
    if (minuteWords.length > 0) {
      // First try to find a vertical minute word
      const verticalMinute = minuteWords.find(w => w.direction === 'vertical');
      if (verticalMinute) {
        return getPositionsFromWordInstance(verticalMinute, word);
      }
      // Fallback to first minute word
      return getPositionsFromWordInstance(minuteWords[0], word);
    }
  }
  
  // For hour category, prefer horizontal direction among hour-categorized words
  if (preferredCategory === 'hour') {
    const hourWords = wordInstances.filter(w => w.category === 'hour');
    if (hourWords.length > 0) {
      // First try to find a horizontal hour word
      const horizontalHour = hourWords.find(w => w.direction === 'horizontal');
      if (horizontalHour) {
        return getPositionsFromWordInstance(horizontalHour, word);
      }
      // Fallback to first hour word
      return getPositionsFromWordInstance(hourWords[0], word);
    }
  }
  
  // For connector category, prefer vertical direction
  if (preferredCategory === 'connector') {
    const connectorWords = wordInstances.filter(w => w.category === 'connector');
    if (connectorWords.length > 0) {
      // First try to find a vertical connector
      const verticalConnector = connectorWords.find(w => w.direction === 'vertical');
      if (verticalConnector) {
        return getPositionsFromWordInstance(verticalConnector, word);
      }
      // Fallback to first connector word
      return getPositionsFromWordInstance(connectorWords[0], word);
    }
  }
  
  // For military category or other fallback
  const categoryWords = wordInstances.filter(w => w.category === preferredCategory);
  if (categoryWords.length > 0) {
    return getPositionsFromWordInstance(categoryWords[0], word);
  }
  
  // Final fallback to first instance
  return getPositionsFromWordInstance(wordInstances[0], word);
}

// Helper function to get positions from a word instance
function getPositionsFromWordInstance(wordInstance: any, word: string): Array<{row: number, col: number}> {
  const { startRow, startCol, direction } = wordInstance;
  const positions: Array<{row: number, col: number}> = [];
  
  for (let i = 0; i < word.length; i++) {
    const row = direction === 'horizontal' ? startRow : startRow + i;
    const col = direction === 'horizontal' ? startCol + i : startCol;
    positions.push({ row, col });
  }
  
  return positions;
}

function getLetterPositions(layout: ClockLayout, word: string, preferredCategory?: 'hour' | 'minute' | 'military' | 'connector'): Array<{row: number, col: number}> {
  // For layouts that support categories, use category-based priority
  if (preferredCategory && (layout.name === 'Auto Layout' || layout.name === 'Updated Layout' || layout.name === 'Gracegpt4')) {
    return findWordWithCategoryPriority(layout, word, preferredCategory);
  }
  
  // Fallback to first match for other layouts or when no category specified
  const wordPos = layout.words.find(w => w.word === word);
  if (!wordPos) return [];
  
  const { startRow, startCol, direction } = wordPos;
  const positions: Array<{row: number, col: number}> = [];
  
  for (let i = 0; i < word.length; i++) {
    const row = direction === 'horizontal' ? startRow : startRow + i;
    const col = direction === 'horizontal' ? startCol + i : startCol;
    positions.push({ row, col });
  }
  
  return positions;
}

const CategorizedLetterGrid: React.FC<CategorizedLetterGridProps> = ({ layout, activeWordsWithCategory, fontSettings }) => {
  const grid = createLetterGrid(layout);
  
  // Get all active letter positions using category information
  const activePositions = new Set<string>();
  activeWordsWithCategory.forEach(({ word, category }) => {
    const positions = getLetterPositions(layout, word, category);
    positions.forEach(pos => {
      activePositions.add(`${pos.row}-${pos.col}`);
    });
  });
  
  const letterStyle = {
    fontFamily: fontSettings.family,
    fontWeight: fontSettings.weight,
    fontSize: `${fontSettings.size}px`,
    letterSpacing: `${fontSettings.letterSpacing}em`,
    lineHeight: fontSettings.lineHeight,
  };
  
  return (
    <div 
      className="inline-block border-2 border-gray-300 p-4 bg-black"
      style={letterStyle}
    >
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((letter, colIndex) => {
            const isActive = activePositions.has(`${rowIndex}-${colIndex}`);
            const isEmpty = letter === ' ';
            
            return (
              <span
                key={`${rowIndex}-${colIndex}`}
                className={`
                  inline-block text-center transition-all duration-300
                  ${isActive ? 'text-white' : 'text-gray-700'}
                  ${isEmpty ? 'invisible' : 'visible'}
                `}
                style={{
                  width: `${fontSettings.size * 0.8}px`,
                  height: `${fontSettings.size * fontSettings.lineHeight}px`,
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const LetterGrid: React.FC<LetterGridProps> = ({ layout, activeWords, fontSettings }) => {
  const grid = createLetterGrid(layout);
  
  // Get all active letter positions
  const activePositions = new Set<string>();
  activeWords.forEach(word => {
    const positions = getLetterPositions(layout, word);
    positions.forEach(pos => {
      activePositions.add(`${pos.row}-${pos.col}`);
    });
  });
  
  const letterStyle = {
    fontFamily: fontSettings.family,
    fontWeight: fontSettings.weight,
    fontSize: `${fontSettings.size}px`,
    letterSpacing: `${fontSettings.letterSpacing}em`,
    lineHeight: fontSettings.lineHeight,
  };
  
  return (
    <div 
      className="inline-block border-2 border-gray-300 p-4 bg-black"
      style={letterStyle}
    >
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((letter, colIndex) => {
            const isActive = activePositions.has(`${rowIndex}-${colIndex}`);
            const isEmpty = letter === ' ';
            
            return (
              <span
                key={`${rowIndex}-${colIndex}`}
                className={`
                  inline-block text-center transition-all duration-300
                  ${isActive ? 'text-white' : 'text-gray-700'}
                  ${isEmpty ? 'invisible' : 'visible'}
                `}
                style={{
                  width: `${fontSettings.size * 0.8}px`,
                  height: `${fontSettings.size * fontSettings.lineHeight}px`,
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const ClockDisplay: React.FC<ClockDisplayProps> = ({ 
  layout, 
  hours, 
  minutes, 
  fontSettings 
}) => {
  const militaryTime = convertToMilitaryTime(hours, minutes, layout.name);
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {layout.name}
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          {militaryTime.description}
        </p>
      </div>
      
      {(layout.name === 'Auto Layout' || layout.name === 'Updated Layout' || layout.name === 'Gracegpt4') ? (
        <CategorizedLetterGrid 
          layout={layout}
          activeWordsWithCategory={militaryTime.wordsWithCategory}
          fontSettings={fontSettings}
        />
      ) : (
        <LetterGrid 
          layout={layout}
          activeWords={militaryTime.words}
          fontSettings={fontSettings}
        />
      )}
      
      <div className="text-sm text-gray-500 mt-2">
        Active words: {militaryTime.words.join(', ')}
      </div>
    </div>
  );
};

export default ClockDisplay;

