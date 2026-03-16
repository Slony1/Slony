export interface WordOfDay {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  etymology?: string;
  partOfSpeech: string;
}

export interface DailyState {
  wordData: WordOfDay | null;
  loading: boolean;
  error: string | null;
  audioUrl: string | null;
}
