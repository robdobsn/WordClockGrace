import React from 'react';
import { ClockLayout, FontSettings, WordPosition } from '../types/layout';
import { convertToMilitaryTime } from '../utils/militaryTime';

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

function createLetterGrid(layout: ClockLayout): string[][] {
  // Initialize grid with empty spaces
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

function getLetterPositions(layout: ClockLayout, word: string): Array<{row: number, col: number}> {
  const positions: Array<{row: number, col: number}> = [];
  
  const wordPos = layout.words.find(w => w.word === word);
  if (!wordPos) return positions;
  
  const { startRow, startCol, direction } = wordPos;
  
  for (let i = 0; i < word.length; i++) {
    const row = direction === 'horizontal' ? startRow : startRow + i;
    const col = direction === 'horizontal' ? startCol + i : startCol;
    positions.push({ row, col });
  }
  
  return positions;
}

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
  const militaryTime = convertToMilitaryTime(hours, minutes);
  
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
      
      <LetterGrid 
        layout={layout}
        activeWords={militaryTime.words}
        fontSettings={fontSettings}
      />
      
      <div className="text-sm text-gray-500 mt-2">
        Active words: {militaryTime.words.join(', ')}
      </div>
    </div>
  );
};

export default ClockDisplay;

