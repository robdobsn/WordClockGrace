// Generate the exact 15x15 grid as specified
export function generateMilitaryCondensedGrid(): string[][] {
  const gridRows = [
    'ZEROONETWOTENX',
    'THREEFOURFIVES',
    'SIXSEVENEIGHTYN',
    'NINEELEVENPQRS',
    'TWELVETHIRTEENA',
    'FOURTEENFIFTEEN',
    'SIXTEENEIGHTEEN',
    'SEVENTEENABCDEF',
    'NINETEENTWENTYS',
    'TWENTYONEFIVEZZ',
    'TWENTYTWOTWENTY',
    'THIRTYFORTYXXXX',
    'FIFTYFIFTEENABC',
    'HUNDREDZEROXXXX',
    'FORTYFIVEKLMNOP'
  ];

  return gridRows.map(row => row.split(''));
}

// Generate crossword grid with proper intersections
export function generateCrosswordGrid(layout: any): string[][] {
  const grid: string[][] = Array(layout.gridHeight)
    .fill(null)
    .map(() => Array(layout.gridWidth).fill(' '));
  
  // Place all words in the grid, allowing overlaps at intersections
  layout.words.forEach((wordPos: any) => {
    const { word, startRow, startCol, direction } = wordPos;
    
    for (let i = 0; i < word.length; i++) {
      const row = direction === 'horizontal' ? startRow : startRow + i;
      const col = direction === 'horizontal' ? startCol + i : startCol;
      
      if (row >= 0 && row < layout.gridHeight && col >= 0 && col < layout.gridWidth) {
        // For crossword, we allow letters to be overwritten if they match
        // This handles intersections properly
        const existingLetter = grid[row][col];
        const newLetter = word[i];
        
        if (existingLetter === ' ' || existingLetter === newLetter) {
          grid[row][col] = newLetter;
        } else {
          // Conflict - this shouldn't happen in a well-designed crossword
          console.warn(`Letter conflict at (${row}, ${col}): existing '${existingLetter}' vs new '${newLetter}'`);
        }
      }
    }
  });
  
  return grid;
}

// Verify that a word exists at the specified position in the grid
export function verifyWordInGrid(grid: string[][], word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical'): boolean {
  for (let i = 0; i < word.length; i++) {
    const row = direction === 'horizontal' ? startRow : startRow + i;
    const col = direction === 'horizontal' ? startCol + i : startCol;
    
    if (row >= grid.length || col >= grid[0].length) {
      return false;
    }
    
    if (grid[row][col] !== word[i]) {
      return false;
    }
  }
  
  return true;
}
