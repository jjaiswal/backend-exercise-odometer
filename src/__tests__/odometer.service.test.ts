import { OdometerService } from '../odometer.service';
import { MockOCRProvider } from './mocks/ocr.provider.mock';

describe('OdometerService', () => {
  let service: OdometerService;
  let mockOcrProvider: MockOCRProvider;

  beforeEach(() => {
    mockOcrProvider = new MockOCRProvider();
    service = new OdometerService(mockOcrProvider);
  });

  describe('Happy Path', () => {
    it('should extract reading and return high confidence for clear odometer image', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 95 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        reading: 48253,
        unit: 'miles',
        confidence: 'high',
      });
    });

    it('should return medium confidence for decent quality image', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 75 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        reading: 48253,
        unit: 'miles',
        confidence: 'medium',
      });
    });

    it('should return low confidence for poor quality image (60-69%)', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 65 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        reading: 48253,
        unit: 'miles',
        confidence: 'low',
      });
    });

    it('should support .jpeg format', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 85 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpeg',
      });

      expect(result).toEqual({
        reading: 48253,
        unit: 'miles',
        confidence: 'high',
      });
    });

    it('should support .png format', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 85 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.png',
      });

      expect(result).toEqual({
        reading: 48253,
        unit: 'miles',
        confidence: 'high',
      });
    });

    it('should return valid JSON structure with correct types', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 85 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toHaveProperty('reading');
      expect(result).toHaveProperty('unit');
      expect(result).toHaveProperty('confidence');
      expect(typeof (result as any).reading).toBe('number');
      expect(typeof (result as any).unit).toBe('string');
      expect(typeof (result as any).confidence).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should return UNREADABLE_IMAGE for very blurry image with confidence < 60', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 50 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        error: 'UNREADABLE_IMAGE',
        message: 'Could not extract a mileage reading from the provided image',
      });
    });

    it('should return UNREADABLE_IMAGE when OCR returns empty string', async () => {
      mockOcrProvider.setMockResult({ text: '', confidence: 0 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        error: 'UNREADABLE_IMAGE',
        message: 'Could not extract a mileage reading from the provided image',
      });
    });

    it('should return UNREADABLE_IMAGE when OCR returns non-numeric text', async () => {
      mockOcrProvider.setMockResult({
        text: 'SERVICE REQUIRED',
        confidence: 90,
      });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        error: 'UNREADABLE_IMAGE',
        message: 'Could not extract a mileage reading from the provided image',
      });
    });

    it('should extract digits from OCR text with special characters', async () => {
      mockOcrProvider.setMockResult({ text: '48,253', confidence: 85 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        reading: 48253,
        unit: 'miles',
        confidence: 'high',
      });
    });

    it('should return UNREADABLE_IMAGE for very small image', async () => {
      mockOcrProvider.setMockResult({ text: '', confidence: 10 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        error: 'UNREADABLE_IMAGE',
        message: 'Could not extract a mileage reading from the provided image',
      });
    });

    it('should return UNREADABLE_IMAGE for corrupted image file', async () => {
      mockOcrProvider.setMockError(new Error('Invalid image'));

      const result = await service.processImage({
        imageBuffer: Buffer.from('corrupted'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        error: 'UNREADABLE_IMAGE',
        message: 'Could not extract a mileage reading from the provided image',
      });
    });

    it('should accept confidence at 70% as medium', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 70 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        reading: 48253,
        unit: 'miles',
        confidence: 'medium',
      });
    });

    it('should accept confidence at 60% as low', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 60 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        reading: 48253,
        unit: 'miles',
        confidence: 'low',
      });
    });

    it('should reject confidence just below threshold 59.9%', async () => {
      mockOcrProvider.setMockResult({ text: '48253', confidence: 59.9 });

      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        error: 'UNREADABLE_IMAGE',
        message: 'Could not extract a mileage reading from the provided image',
      });
    });
  });

  describe('Error Cases', () => {
    it('should return MISSING_IMAGE when image buffer is not provided', async () => {
      const result = await service.processImage({
        imageBuffer: Buffer.alloc(0),
        filename: 'odometer.jpg',
      });

      expect(result).toEqual({
        error: 'MISSING_IMAGE',
        message: 'Image is required',
      });
    });

    it('should return UNSUPPORTED_FILE_TYPE for .gif format', async () => {
      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.gif',
      });

      expect(result).toEqual({
        error: 'UNSUPPORTED_FILE_TYPE',
        message: 'Only JPEG and PNG formats are supported',
      });
    });

    it('should return UNSUPPORTED_FILE_TYPE for .bmp format', async () => {
      const result = await service.processImage({
        imageBuffer: Buffer.from('fake'),
        filename: 'odometer.bmp',
      });

      expect(result).toEqual({
        error: 'UNSUPPORTED_FILE_TYPE',
        message: 'Only JPEG and PNG formats are supported',
      });
    });
  });
});
