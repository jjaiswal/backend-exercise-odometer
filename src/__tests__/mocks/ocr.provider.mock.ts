import { OCRResult } from '../../types';

export class MockOCRProvider {
  private mockResult: OCRResult | null = null;
  private mockError: Error | null = null;

  setMockResult(result: OCRResult): void {
    this.mockResult = result;
    this.mockError = null;
  }

  setMockError(error: Error): void {
    this.mockError = error;
    this.mockResult = null;
  }

  async processImage(imageBuffer: Buffer): Promise<OCRResult> {
    if (this.mockError) {
      throw this.mockError;
    }

    if (!this.mockResult) {
      throw new Error('Mock result not set');
    }

    return this.mockResult;
  }
}
