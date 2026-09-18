export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum ErrorCode {
  MISSING_IMAGE = 'MISSING_IMAGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  UNREADABLE_IMAGE = 'UNREADABLE_IMAGE',
}

export interface OdometerReading {
  reading: number;
  unit: string;
  confidence: ConfidenceLevel;
}

export interface OdometerError {
  error: ErrorCode;
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
