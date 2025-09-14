export interface WordPosition {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
  category: 'hour' | 'minute' | 'connector' | 'military';
}

export interface ClockLayout {
  name: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  words: WordPosition[];
}

export interface FontSettings {
  family: string;
  weight: string;
  size: number;
  letterSpacing: number;
  lineHeight: number;
}

export interface TimeSettings {
  hours: number;
  minutes: number;
  useCurrentTime: boolean;
}

