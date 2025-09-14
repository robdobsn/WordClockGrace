// Grid Analyzer Utility for Word Clock Layouts

import * as fs from 'fs';
import * as path from 'path';

export interface WordPosition {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
  category: 'hour' | 'minute' | 'military' | 'connector';
}

export interface ClockLayout {
  name: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  words: WordPosition[];
}

// Specific horizontal words to search for
const HORIZONTAL_WORDS = [
  'THIR', 'SIX', 'THREE', 'EIGHT', 'ZERO', 'FIF', 'FIVE', 'TEN', 
  'NINE', 'FOUR', 'SEVEN', 'ONE', 'TWO', 'TEEN'
];

// Specific vertical words to search for  
const VERTICAL_WORDS = [
  'TWENTY', 'FIVE', 'THIRTY', 'FORTY', 'FIFTY', 'FIFTEEN', 'HUNDRED'
];

export class GridAnalyzer {
  private grid: string[];
  private foundWords: WordPosition[] = [];

  constructor(gridLines: string[]) {
    this.grid = gridLines.map(line => line.trim());
  }

  public analyzeGrid(): ClockLayout {
    this.foundWords = [];
    
    // Search for horizontal words
    this.findHorizontalWords();
    
    // Search for vertical words  
    this.findVerticalWords();
    
    // Categorize words
    this.categorizeWords();
    
    const gridWidth = Math.max(...this.grid.map(row => row.length));
    const gridHeight = this.grid.length;
    
    return {
      name: 'Generated Layout',
      description: `Auto-generated layout from ${gridWidth}x${gridHeight} grid`,
      gridWidth,
      gridHeight,
      words: this.foundWords
    };
  }

  private findHorizontalWords(): void {
    for (let row = 0; row < this.grid.length; row++) {
      const rowText = this.grid[row];
      
      for (const word of ALL_TIME_WORDS) {
        let startIndex = 0;
        let foundIndex = rowText.indexOf(word, startIndex);
        
        while (foundIndex !== -1) {
          // Verify it's a complete word (not part of a larger word)
          const beforeChar = foundIndex > 0 ? rowText[foundIndex - 1] : '.';
          const afterChar = foundIndex + word.length < rowText.length ? 
                           rowText[foundIndex + word.length] : '.';
          
          if (this.isWordBoundary(beforeChar) && this.isWordBoundary(afterChar)) {
            this.foundWords.push({
              word,
              startRow: row,
              startCol: foundIndex,
              direction: 'horizontal',
              category: 'hour' // Will be categorized later
            });
          }
          
          startIndex = foundIndex + 1;
          foundIndex = rowText.indexOf(word, startIndex);
        }
      }
    }
  }

  private findVerticalWords(): void {
    const gridWidth = Math.max(...this.grid.map(row => row.length));
    
    for (let col = 0; col < gridWidth; col++) {
      const columnText = this.getColumn(col);
      
      for (const word of ALL_TIME_WORDS) {
        let startIndex = 0;
        let foundIndex = columnText.indexOf(word, startIndex);
        
        while (foundIndex !== -1) {
          // Verify it's a complete word
          const beforeChar = foundIndex > 0 ? columnText[foundIndex - 1] : '.';
          const afterChar = foundIndex + word.length < columnText.length ? 
                           columnText[foundIndex + word.length] : '.';
          
          if (this.isWordBoundary(beforeChar) && this.isWordBoundary(afterChar)) {
            this.foundWords.push({
              word,
              startRow: foundIndex,
              startCol: col,
              direction: 'vertical',
              category: 'hour' // Will be categorized later
            });
          }
          
          startIndex = foundIndex + 1;
          foundIndex = columnText.indexOf(word, startIndex);
        }
      }
    }
  }

  private getColumn(colIndex: number): string {
    return this.grid.map(row => row[colIndex] || '.').join('');
  }

  private isWordBoundary(char: string): boolean {
    return !char || char === '.' || char === ' ' || !/[A-Z]/i.test(char);
  }

  private categorizeWords(): void {
    for (const wordPos of this.foundWords) {
      wordPos.category = this.getWordCategory(wordPos.word, wordPos.direction);
    }
  }

  private getWordCategory(word: string, direction: 'horizontal' | 'vertical'): 'hour' | 'minute' | 'military' | 'connector' {
    // Special military/connector words
    const militaryWords = ['HUNDRED', 'HOURS'];
    const connectorWords = ['OH', 'OCLOCK'];
    
    if (militaryWords.includes(word)) return 'military';
    if (connectorWords.includes(word)) return 'connector';
    
    // Categorize based on direction: horizontal = hour, vertical = minute
    if (direction === 'horizontal') return 'hour';
    if (direction === 'vertical') return 'minute';
    
    return 'hour'; // fallback
  }

  public printAnalysis(): void {
    console.log('\n=== GRID ANALYSIS ===');
    console.log(`Grid size: ${Math.max(...this.grid.map(r => r.length))} x ${this.grid.length}`);
    console.log('\nGrid:');
    this.grid.forEach((row, i) => {
      console.log(`${i.toString().padStart(2)}: ${row}`);
    });
    
    console.log('\nHorizontal Words:');
    const horizontalWords = this.foundWords.filter(w => w.direction === 'horizontal');
    horizontalWords.forEach(w => {
      console.log(`  ${w.word} at (${w.startRow}, ${w.startCol}) - ${w.category}`);
    });
    
    console.log('\nVertical Words:');
    const verticalWords = this.foundWords.filter(w => w.direction === 'vertical');
    verticalWords.forEach(w => {
      console.log(`  ${w.word} at (${w.startRow}, ${w.startCol}) - ${w.category}`);
    });
    
    console.log(`\nTotal words found: ${this.foundWords.length}`);
  }
}

export function analyzeGridFromFile(inputFile: string, outputFile: string): void {
  try {
    // Read grid from file
    const gridContent = fs.readFileSync(inputFile, 'utf-8');
    const gridLines = gridContent.split('\n').filter(line => line.trim().length > 0);
    
    // Analyze grid
    const analyzer = new GridAnalyzer(gridLines);
    const layout = analyzer.analyzeGrid();
    
    // Print analysis
    analyzer.printAnalysis();
    
    // Generate layout name from output filename
    const layoutName = path.basename(outputFile, '.json')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    layout.name = layoutName;
    layout.description = `Generated from ${inputFile}`;
    
    // Write JSON file
    const outputPath = path.join('public', 'layouts', outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(layout, null, 2));
    
    console.log(`\n✅ Layout saved to: ${outputPath}`);
    console.log(`📊 Found ${layout.words.length} words total`);
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('Usage: node gridAnalyzer.js <input-grid-file> <output-json-name>');
    console.log('Example: node gridAnalyzer.js grid.txt my-layout.json');
    process.exit(1);
  }
  
  const [inputFile, outputFile] = args;
  analyzeGridFromFile(inputFile, outputFile);
}
