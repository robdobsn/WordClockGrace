// Crossword planning utility to find optimal letter intersections

export interface WordIntersection {
  word1: string;
  word2: string;
  letter: string;
  word1Index: number;
  word2Index: number;
}

export function findIntersections(horizontalWords: string[], verticalWords: string[]): WordIntersection[] {
  const intersections: WordIntersection[] = [];
  
  for (const hWord of horizontalWords) {
    for (const vWord of verticalWords) {
      for (let i = 0; i < hWord.length; i++) {
        for (let j = 0; j < vWord.length; j++) {
          if (hWord[i] === vWord[j]) {
            intersections.push({
              word1: hWord,
              word2: vWord,
              letter: hWord[i],
              word1Index: i,
              word2Index: j
            });
          }
        }
      }
    }
  }
  
  return intersections;
}

// Hour words (horizontal)
export const HOUR_WORDS = [
  'ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY', 'TWENTYONE', 'TWENTYTWO', 'TWENTYTHREE'
];

// Minute words (vertical)
export const MINUTE_WORDS = [
  'ZERO', 'FIVE', 'TEN', 'FIFTEEN', 'TWENTY', 'TWENTYFIVE', 
  'THIRTY', 'THIRTYFIVE', 'FORTY', 'FORTYFIVE', 'FIFTY', 'FIFTYFIVE'
];

// Find good intersections for crossword layout
export function planCrosswordLayout() {
  const intersections = findIntersections(HOUR_WORDS, MINUTE_WORDS);
  
  // Group by shared letters to find the best reuse opportunities
  const letterGroups: Record<string, WordIntersection[]> = {};
  
  intersections.forEach(intersection => {
    if (!letterGroups[intersection.letter]) {
      letterGroups[intersection.letter] = [];
    }
    letterGroups[intersection.letter].push(intersection);
  });
  
  // Sort by frequency to prioritize common letters
  const sortedLetters = Object.keys(letterGroups).sort(
    (a, b) => letterGroups[b].length - letterGroups[a].length
  );
  
  return { intersections, letterGroups, sortedLetters };
}
