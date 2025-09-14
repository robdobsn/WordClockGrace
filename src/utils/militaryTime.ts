export interface MilitaryTimeWords {
  words: string[];
  description: string;
}

const HOUR_WORDS: Record<number, string> = {
  0: 'ZERO',
  1: 'ONE',
  2: 'TWO', 
  3: 'THREE',
  4: 'FOUR',
  5: 'FIVE',
  6: 'SIX',
  7: 'SEVEN',
  8: 'EIGHT',
  9: 'NINE',
  10: 'TEN',
  11: 'ELEVEN',
  12: 'TWELVE',
  13: 'THIRTEEN',
  14: 'FOURTEEN',
  15: 'FIFTEEN',
  16: 'SIXTEEN',
  17: 'SEVENTEEN',
  18: 'EIGHTEEN',
  19: 'NINETEEN',
  20: 'TWENTY',
  21: 'TWENTYONE',
  22: 'TWENTYTWO',
  23: 'TWENTYTHREE'
};

const MINUTE_WORDS: Record<number, string[]> = {
  0: [], // No minutes for "hundred hours"
  5: ['OH', 'FIVE'],
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

export function convertToMilitaryTime(hours: number, minutes: number): MilitaryTimeWords {
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
  
  // Get hour word
  const hourWord = HOUR_WORDS[adjustedHours];
  if (hourWord) {
    words.push(hourWord);
  }
  
  // Handle minutes
  if (adjustedMinutes === 0) {
    // "Zero hundred hours", "Eleven hundred hours", etc.
    words.push('HUNDRED');
    words.push('HOURS');
    description = `${hourWord} hundred hours`;
  } else {
    // "Eleven oh five hours", "Eleven fifteen hours", etc.
    const minuteWords = MINUTE_WORDS[adjustedMinutes];
    if (minuteWords && minuteWords.length > 0) {
      words.push(...minuteWords);
    }
    words.push('HOURS');
    
    if (adjustedMinutes < 10) {
      description = `${hourWord} oh ${adjustedMinutes.toString().padStart(2, '0')} hours`;
    } else {
      description = `${hourWord} ${adjustedMinutes} hours`;
    }
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
