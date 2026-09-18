export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum ErrorCode {
  MISSING_IMAGE = 'MISSING_IMAGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNREADABLE_IMAGE = 'UNREADABLE_IMAGE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
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
