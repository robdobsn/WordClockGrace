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
