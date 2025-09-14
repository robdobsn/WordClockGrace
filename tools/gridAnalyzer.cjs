// Grid Analyzer Utility for Word Clock Layouts

const fs = require('fs');
const path = require('path');

// Specific horizontal words to search for
const HORIZONTAL_WORDS = [
  'THIR', 'SIX', 'THREE', 'EIGHT', 'ZERO', 'FIF', 'FIVE', 'TEN', 
  'NINE', 'FOUR', 'SEVEN', 'ONE', 'TWO', 'TEEN'
];

// Specific vertical words to search for  
const VERTICAL_WORDS = [
  'TWENTY', 'FIVE', 'THIRTY', 'FORTY', 'FIFTY', 'FIFTEEN', 'HUNDRED'
];

class GridAnalyzer {
  constructor(gridLines) {
    this.grid = gridLines.map(line => line.trim());
    this.foundWords = [];
  }

  analyzeGrid() {
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

  findHorizontalWords() {
    for (let row = 0; row < this.grid.length; row++) {
      const rowText = this.grid[row];
      
      for (const word of HORIZONTAL_WORDS) {
        let startIndex = 0;
        let foundIndex = rowText.indexOf(word, startIndex);
        
        while (foundIndex !== -1) {
          // For word search grids, we accept any occurrence of the word
          this.foundWords.push({
            word,
            startRow: row,
            startCol: foundIndex,
            direction: 'horizontal',
            category: 'hour' // Will be categorized later
          });
          
          startIndex = foundIndex + 1;
          foundIndex = rowText.indexOf(word, startIndex);
        }
      }
    }
  }

  findVerticalWords() {
    const gridWidth = Math.max(...this.grid.map(row => row.length));
    
    for (let col = 0; col < gridWidth; col++) {
      const columnText = this.getColumn(col);
      
      for (const word of VERTICAL_WORDS) {
        let startIndex = 0;
        let foundIndex = columnText.indexOf(word, startIndex);
        
        while (foundIndex !== -1) {
          // For word search grids, we accept any occurrence of the word
          this.foundWords.push({
            word,
            startRow: foundIndex,
            startCol: col,
            direction: 'vertical',
            category: 'minute' // Will be categorized later
          });
          
          startIndex = foundIndex + 1;
          foundIndex = columnText.indexOf(word, startIndex);
        }
      }
    }
  }

  getColumn(colIndex) {
    return this.grid.map(row => row[colIndex] || '.').join('');
  }

  isWordBoundary(char) {
    // For word search grids, we don't need strict word boundaries
    // Just check that we're not going out of bounds
    return true;
  }

  categorizeWords() {
    for (const wordPos of this.foundWords) {
      wordPos.category = this.getWordCategory(wordPos.word);
    }
    
    // Remove duplicates (same word at same position)
    const uniqueWords = [];
    const seen = new Set();
    
    for (const wordPos of this.foundWords) {
      const key = `${wordPos.word}-${wordPos.startRow}-${wordPos.startCol}-${wordPos.direction}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueWords.push(wordPos);
      }
    }
    
    this.foundWords = uniqueWords;
  }

  getWordCategory(word) {
    // Words that can be minutes when vertical
    const minuteWords = ['TWENTY', 'FIVE', 'THIRTY', 'FORTY', 'FIFTY', 'FIFTEEN'];
    const militaryWords = ['HUNDRED'];
    
    if (militaryWords.includes(word)) return 'military';
    if (minuteWords.includes(word)) return 'minute';
    return 'hour';
  }

  printAnalysis() {
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

function analyzeGridFromFile(inputFile, outputFile) {
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
    console.error('❌ Error:', error.message || error);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('Usage: node gridAnalyzer.cjs <input-grid-file> <output-json-name>');
    console.log('Example: node gridAnalyzer.cjs grid.txt my-layout.json');
    process.exit(1);
  }
  
  const [inputFile, outputFile] = args;
  analyzeGridFromFile(inputFile, outputFile);
}

module.exports = { GridAnalyzer, analyzeGridFromFile };
