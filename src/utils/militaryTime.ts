export interface MilitaryTimeWords {
  words: string[];
  description: string;
}

const HOUR_WORDS: Record<number, string[]> = {
  0: ['ZERO'],
  1: ['ONE'],
  2: ['TWO'], 
  3: ['THREE'],
  4: ['FOUR'],
  5: ['FIVE'],
  6: ['SIX'],
  7: ['SEVEN'],
  8: ['EIGHT'],
  9: ['NINE'],
  10: ['TEN'],
  11: ['ELEVEN'],
  12: ['TWELVE'],
  13: ['THIRTEEN'],
  14: ['FOURTEEN'],
  15: ['FIFTEEN'],
  16: ['SIXTEEN'],
  17: ['SEVENTEEN'],
  18: ['EIGHTEEN'],
  19: ['NINETEEN'],
  20: ['TWENTY'],
  21: ['TWENTY', 'ONE'],
  22: ['TWENTY', 'TWO'],
  23: ['TWENTY', 'THREE']
};

const MINUTE_WORDS: Record<number, string[]> = {
  0: [], // No minutes for "hundred hours"
  5: ['FIVE'],
  10: ['TEN'],
  15: ['FIFTEEN'],
  20: ['TWENTY'],
  25: ['TWENTY', 'FIVE'],
  30: ['THIRTY'],
  35: ['THIRTY', 'FIVE'],
  40: ['FORTY'],
  45: ['FORTY', 'FIVE'],
  50: ['FIFTY'],
  55: ['FIFTY', 'FIVE']
};

// Alternative minute words for crossword layout (using composite words)
const CROSSWORD_MINUTE_WORDS: Record<number, string[]> = {
  0: [], // No minutes for "hundred hours"
  5: ['FIVE'],
  10: ['TEN'],
  15: ['FIFTEEN'],
  20: ['TWENTY'],
  25: ['TWENTYFIVE'],
  30: ['THIRTY'],
  35: ['THIRTYFIVE'],
  40: ['FORTY'],
  45: ['FORTYFIVE'],
  50: ['FIFTY'],
  55: ['FIFTYFIVE']
};

// GraceGPT specific word mappings
const GRACEGPT_HOUR_WORDS: Record<number, string[]> = {
  0: ['ZERO'],
  1: ['ONE'],
  2: ['TWO'], 
  3: ['THREE'],
  4: ['FOUR'],
  5: ['FIVE'],
  6: ['SIX'],
  7: ['SEVEN'],
  8: ['EIGHT'],
  9: ['NINE'],
  10: ['TEN'],
  11: ['ELEVEN'],
  12: ['TWELVE'],
  13: ['THIR', 'TEEN'],
  14: ['FOUR', 'TEEN'],
  15: ['FIF', 'TEEN'],
  16: ['SIX', 'TEEN'],
  17: ['SEVEN', 'TEEN'],
  18: ['EIGHT', 'TEEN'],
  19: ['NINE', 'TEEN'],
  20: ['TWENTY'],
  21: ['TWENTY', 'ONE'],
  22: ['TWENTY', 'TWO'],
  23: ['TWENTY', 'THREE']
};

const GRACEGPT_MINUTE_WORDS: Record<number, string[]> = {
  0: ['HUNDRED'],
  5: ['FIVE'],
  10: ['TEN'],
  15: ['FIF', 'TEEN'],
  20: ['TWENTY'],
  25: ['TWENTY', 'FIVE'],
  30: ['THIRTY'],
  35: ['THIRTY', 'FIVE'],
  40: ['FORTY'],
  45: ['FORTY', 'FIVE'],
  50: ['FIFTY'],
  55: ['FIFTY', 'FIVE']
};

// Fragment-based word mappings for auto-generated layouts
const FRAGMENT_HOUR_WORDS: Record<number, string[]> = {
  0: ['ZERO'],
  1: ['ONE'],
  2: ['TWO'], 
  3: ['THREE'],
  4: ['FOUR'],
  5: ['FIVE'],
  6: ['SIX'],
  7: ['SEVEN'],
  8: ['EIGHT'],
  9: ['NINE'],
  10: ['TEN'],
  11: ['ELEVEN'],
  12: ['TWELVE'],
  13: ['THIR', 'TEEN'],
  14: ['FOUR', 'TEEN'],
  15: ['FIF', 'TEEN'],
  16: ['SIX', 'TEEN'],
  17: ['SEVEN', 'TEEN'],
  18: ['EIGHT', 'TEEN'],
  19: ['NINE', 'TEEN'],
  20: ['TWENTY'],
  21: ['TWENTY', 'ONE'],
  22: ['TWENTY', 'TWO'],
  23: ['TWENTY', 'THREE']
};

const FRAGMENT_MINUTE_WORDS: Record<number, string[]> = {
  0: ['HUNDRED'],
  5: ['FIVE'],
  10: ['TEN'],
  15: ['FIFTEEN'],
  20: ['TWENTY'],
  25: ['TWENTY', 'FIVE'],
  30: ['THIRTY'],
  35: ['THIRTY', 'FIVE'],
  40: ['FORTY'],
  45: ['FORTY', 'FIVE'],
  50: ['FIFTY'],
  55: ['FIFTY', 'FIVE']
};

export function convertToMilitaryTime(hours: number, minutes: number, layoutName?: string): MilitaryTimeWords {
  // Round minutes to nearest 5
  const roundedMinutes = Math.round(minutes / 5) * 5;
  
  // Handle hour rollover if minutes round up to 60
  let adjustedHours = hours;
  let adjustedMinutes = roundedMinutes;
  
  if (adjustedMinutes >= 60) {
    adjustedMinutes = 0;
    adjustedHours = (adjustedHours + 1) % 24;
  }
  
  const words: string[] = [];
  let description = '';
  
  // Choose word mappings based on layout
  let hourWordsMap = HOUR_WORDS;
  let minuteWordsMap = MINUTE_WORDS;
  
  if (layoutName === 'Crossword One') {
    minuteWordsMap = CROSSWORD_MINUTE_WORDS;
  } else if (layoutName === 'GraceGPT' || layoutName === 'GraceGPT2') {
    hourWordsMap = GRACEGPT_HOUR_WORDS;
    minuteWordsMap = GRACEGPT_MINUTE_WORDS;
  } else if (layoutName === 'Auto Layout' || layoutName === 'Updated Layout') {
    // Use fragment-based mappings for auto-generated layouts
    hourWordsMap = FRAGMENT_HOUR_WORDS;
    minuteWordsMap = FRAGMENT_MINUTE_WORDS;
  }
  
  // Get hour words (can be multiple for certain hours)
  const hourWords = hourWordsMap[adjustedHours];
  if (hourWords) {
    words.push(...hourWords);
  }
  
  // Handle minutes
  if (adjustedMinutes === 0) {
    // For GraceGPT, 0 minutes uses "HUNDRED", for others use "HUNDRED"
    const zeroMinuteWords = minuteWordsMap[0];
    if (zeroMinuteWords && zeroMinuteWords.length > 0) {
      words.push(...zeroMinuteWords);
    } else {
      words.push('HUNDRED');
    }
    description = `${hourWords?.join(' ')} hundred`;
  } else {
    // "Eleven five", "Eleven fifteen", etc.
    const minuteWords = minuteWordsMap[adjustedMinutes];
    if (minuteWords && minuteWords.length > 0) {
      words.push(...minuteWords);
    }
    
    const hourDesc = hourWords?.join(' ') || '';
    const minuteDesc = minuteWords?.join(' ') || '';
    description = `${hourDesc} ${minuteDesc}`;
  }
  
  return {
    words,
    description
  };
}

export function getCurrentTime(): { hours: number; minutes: number } {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes()
  };
}
