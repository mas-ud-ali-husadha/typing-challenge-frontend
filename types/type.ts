export interface SubmitPayload {
  username: string | null;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timeSpent: number;
  textId: string;
  errorCount: number;
}