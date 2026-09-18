export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface OdometerReading {
  reading: number;
  unit: string;
  confidence: ConfidenceLevel;
}

export interface OdometerError {
  error: string;
  message: string;
}

export type OdometerResponse = OdometerReading | OdometerError;

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface ProcessImageOptions {
  imageBuffer: Buffer;
  filename: string;
}
