import { OdometerResponse, ProcessImageOptions, ErrorCode } from './types';
import { OCRProvider } from './ocr.provider';
import { CONFIDENCE_THRESHOLDS, SUPPORTED_IMAGE_FORMATS } from './constants';
import { getConfidenceLevel, createErrorResponse } from './utils';

export class OdometerService {
  constructor(private ocrProvider: OCRProvider) {}

  async processImage(options: ProcessImageOptions): Promise<OdometerResponse> {
    const { imageBuffer, filename } = options;

    if (!imageBuffer || imageBuffer.length === 0) {
      return createErrorResponse(ErrorCode.MISSING_IMAGE);
    }

    const fileExtension = this.getFileExtension(filename);
    if (!SUPPORTED_IMAGE_FORMATS.includes(fileExtension as any)) {
      return createErrorResponse(ErrorCode.UNSUPPORTED_FILE_TYPE);
    }

    try {
      const ocrResult = await this.ocrProvider.processImage(imageBuffer);

      if (ocrResult.confidence < CONFIDENCE_THRESHOLDS.REJECT) {
        return createErrorResponse(ErrorCode.UNREADABLE_IMAGE);
      }

      const cleanedText = this.extractNumericValue(ocrResult.text);
      if (!cleanedText) {
        return createErrorResponse(ErrorCode.UNREADABLE_IMAGE);
      }

      const reading = parseInt(cleanedText, 10);
      if (isNaN(reading)) {
        return createErrorResponse(ErrorCode.UNREADABLE_IMAGE);
      }

      const confidence = getConfidenceLevel(ocrResult.confidence);
      if (confidence === null) {
        return createErrorResponse(ErrorCode.UNREADABLE_IMAGE);
      }

      return {
        reading,
        unit: 'miles',
        confidence,
      };
    } catch {
      return createErrorResponse(ErrorCode.UNREADABLE_IMAGE);
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private extractNumericValue(text: string): string {
    const digits = text.replace(/\D/g, '');
    return digits;
  }
}
