export interface AudioSlice {
  id: string;
  start: number;
  end: number;
  color?: string;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  message: string;
}

export enum AppMode {
  IDLE = 'IDLE',
  READY = 'READY',
  PLAYING = 'PLAYING',
}

// Gemini Response Schema Types
export interface SliceResponse {
  slices: number[];
  bpm?: number;
  genre?: string;
}
