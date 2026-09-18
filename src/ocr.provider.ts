import { OCRResult } from './types';

export interface OCRProvider {
  processImage(imageBuffer: Buffer): Promise<OCRResult>;
}
