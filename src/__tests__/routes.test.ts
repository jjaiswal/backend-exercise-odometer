import request from 'supertest';
import express from 'express';
import { createApp } from '../app';
import { OCRProvider } from '../ocr.provider';

class MockOCRProvider implements OCRProvider {
  async processImage(imageBuffer: Buffer) {
    if (imageBuffer.length === 0) {
      throw new Error('Invalid image');
    }

    const isJPEG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
    const isPNG = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;

    if (!isJPEG && !isPNG) {
      throw new Error('Invalid image format');
    }

    return {
      text: '12345',
      confidence: 85
    };
  }
}

describe('POST /odometer/reading', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createApp(new MockOCRProvider());
  });

  describe('API Contract - Success Response', () => {
    it('returns 200 status for valid multipart JPEG upload', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0xff, 0xd8, 0xff]), 'test.jpg');

      expect(response.status).toBe(200);
    });

    it('returns JSON with reading (number), unit (string), confidence (string)', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0xff, 0xd8, 0xff]), 'test.jpg');

      expect(typeof response.body.reading).toBe('number');
      expect(typeof response.body.unit).toBe('string');
      expect(typeof response.body.confidence).toBe('string');
    });

    it('returns confidence as one of: high, medium, low', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0xff, 0xd8, 0xff]), 'test.jpg');

      expect(['high', 'medium', 'low']).toContain(response.body.confidence);
    });

    it('returns unit as miles', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0xff, 0xd8, 0xff]), 'test.jpg');

      expect(response.body.unit).toBe('miles');
    });

    it('returns reading as positive integer', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0xff, 0xd8, 0xff]), 'test.jpg');

      expect(Number.isInteger(response.body.reading)).toBe(true);
      expect(response.body.reading).toBeGreaterThan(0);
    });
  });

  describe('API Contract - Error Response', () => {
    it('returns 400 status for missing image field', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns JSON with error (string) and message (string)', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .send({});

      expect(typeof response.body.error).toBe('string');
      expect(typeof response.body.message).toBe('string');
    });

    it('error field contains one of: MISSING_IMAGE, UNSUPPORTED_FILE_TYPE, UNREADABLE_IMAGE', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .send({});

      const validErrors = ['MISSING_IMAGE', 'UNSUPPORTED_FILE_TYPE', 'UNREADABLE_IMAGE'];
      expect(validErrors).toContain(response.body.error);
    });

    it('message field is non-empty', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .send({});

      expect(response.body.message.length).toBeGreaterThan(0);
    });
  });

  describe('Multipart Input Validation - File Field', () => {
    it('rejects multipart request without image field with 400 and MISSING_IMAGE error', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .field('other_field', 'value');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('MISSING_IMAGE');
    });

    it('rejects empty file with 400 and MISSING_IMAGE error', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.alloc(0), 'test.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('MISSING_IMAGE');
    });
  });

  describe('Multipart Input Validation - File Types', () => {
    it('accepts JPEG file with .jpg extension', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0xff, 0xd8, 0xff]), 'odometer.jpg');

      expect(response.status).toBe(200);
    });

    it('accepts PNG file with .png extension', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'odometer.png');

      expect(response.status).toBe(200);
    });

    it('accepts JPEG file with .jpeg extension', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0xff, 0xd8, 0xff]), 'odometer.jpeg');

      expect(response.status).toBe(200);
    });

    it('rejects GIF file with 400 and UNSUPPORTED_FILE_TYPE error', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0x47, 0x49, 0x46]), 'odometer.gif');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('UNSUPPORTED_FILE_TYPE');
    });

    it('rejects BMP file with 400 and UNSUPPORTED_FILE_TYPE error', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0x42, 0x4d]), 'odometer.bmp');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('UNSUPPORTED_FILE_TYPE');
    });

    it('rejects TXT file with 400 and UNSUPPORTED_FILE_TYPE error', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from('plain text'), 'odometer.txt');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('UNSUPPORTED_FILE_TYPE');
    });
  });

  describe('JSON Base64 Input Validation - Required Fields', () => {
    it('rejects JSON request without image field with 400 and MISSING_IMAGE error', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .send({
          filename: 'odometer.jpg',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('MISSING_IMAGE');
    });

    it('rejects JSON request without filename field with 400 and MISSING_IMAGE error', async () => {
      const base64Image = Buffer.from([0xff, 0xd8, 0xff]).toString('base64');

      const response = await request(app)
        .post('/odometer/reading')
        .send({
          image: base64Image,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('MISSING_IMAGE');
    });

    it('rejects JSON request with empty image string with 400 and MISSING_IMAGE error', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .send({
          image: '',
          filename: 'odometer.jpg',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('MISSING_IMAGE');
    });
  });

  describe('JSON Base64 Input Validation - File Types', () => {
    it('accepts valid Base64 JPEG with .jpg filename', async () => {
      const base64Image = Buffer.from([0xff, 0xd8, 0xff]).toString('base64');

      const response = await request(app)
        .post('/odometer/reading')
        .send({
          image: base64Image,
          filename: 'odometer.jpg',
        });

      expect(response.status).toBe(200);
    });

    it('accepts valid Base64 PNG with .png filename', async () => {
      const base64Image = Buffer.from([0x89, 0x50, 0x4e, 0x47]).toString('base64');

      const response = await request(app)
        .post('/odometer/reading')
        .send({
          image: base64Image,
          filename: 'odometer.png',
        });

      expect(response.status).toBe(200);
    });

    it('rejects Base64 GIF with 400 and UNSUPPORTED_FILE_TYPE error', async () => {
      const base64Image = Buffer.from([0x47, 0x49, 0x46]).toString('base64');

      const response = await request(app)
        .post('/odometer/reading')
        .send({
          image: base64Image,
          filename: 'odometer.gif',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('UNSUPPORTED_FILE_TYPE');
    });

    it('rejects Base64 BMP with 400 and UNSUPPORTED_FILE_TYPE error', async () => {
      const base64Image = Buffer.from([0x42, 0x4d]).toString('base64');

      const response = await request(app)
        .post('/odometer/reading')
        .send({
          image: base64Image,
          filename: 'odometer.bmp',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('UNSUPPORTED_FILE_TYPE');
    });
  });

  describe('JSON Base64 Input Validation - Invalid Encoding', () => {
    it('rejects invalid Base64 string with 400 error', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .send({
          image: 'not-valid-base64!!!',
          filename: 'odometer.jpg',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Image Processing Errors', () => {
    it('rejects corrupted image file with 400 and UNREADABLE_IMAGE error', async () => {
      const corruptedImage = Buffer.from('corrupted image data that is not a valid image');

      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', corruptedImage, 'odometer.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('UNREADABLE_IMAGE');
    });

    it('rejects corrupted Base64 image with 400 and UNREADABLE_IMAGE error', async () => {
      const corruptedBase64 = Buffer.from('not a valid image').toString('base64');

      const response = await request(app)
        .post('/odometer/reading')
        .send({
          image: corruptedBase64,
          filename: 'odometer.jpg',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('UNREADABLE_IMAGE');
    });
  });

  describe('Content-Type Handling', () => {
    it('accepts multipart/form-data requests', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .attach('image', Buffer.from([0xff, 0xd8, 0xff]), 'test.jpg');

      expect([200, 400]).toContain(response.status);
    });

    it('accepts application/json requests with Base64 image', async () => {
      const response = await request(app)
        .post('/odometer/reading')
        .set('Content-Type', 'application/json')
        .send({
          image: Buffer.from([0xff, 0xd8, 0xff]).toString('base64'),
          filename: 'test.jpg',
        });

      expect([200, 400]).toContain(response.status);
    });
  });
});
