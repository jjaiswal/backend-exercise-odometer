import Tesseract from 'tesseract.js';
import { OCRProvider } from './ocr.provider';
import { OCRResult } from './types';

export class TesseractOCRProvider implements OCRProvider {
  async processImage(imageBuffer: Buffer): Promise<OCRResult> {
    try {
      const { data } = await Tesseract.recognize(imageBuffer, 'eng');

      return {
        text: data.text || '',
        confidence: data.confidence || 0,
      };
    } catch (error) {
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
