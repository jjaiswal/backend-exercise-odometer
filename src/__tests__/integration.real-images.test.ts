import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createApp } from '../app';

/**
 * Real odometer image integration tests.
 * Tests the service with actual odometer images from the images/ folder.
 *
 * Note: Some real-world images may not be readable by OCR due to:
 * - Image quality (blur, glare, poor focus)
 * - Lighting conditions
 * - Angle or rotation
 * - Partial visibility of odometer
 *
 * Tests validate response structure, not specific readings.
 */
describe('Real Odometer Image Integration Tests', () => {
  let app: express.Application;
  const imagesDir = path.join(__dirname, '../../images');

  beforeEach(() => {
    app = createApp();
  });

  async function testOdometerImage(
    imageFilename: string,
    uploadMethod: 'multipart' | 'base64'
  ) {
    const imagePath = path.join(imagesDir, imageFilename);
    const imageBuffer = fs.readFileSync(imagePath);

    let response;

    if (uploadMethod === 'multipart') {
      response = await request(app)
        .post('/odometer/reading')
        .attach('image', imageBuffer, 'odometer.jpg');
    } else {
      const base64Image = imageBuffer.toString('base64');
      response = await request(app)
        .post('/odometer/reading')
        .send({
          image: base64Image,
          filename: 'odometer.jpg',
        });
    }

    // Validate response structure based on success/failure
    expect([200, 400]).toContain(response.status);

    if (response.status === 200) {
      // Success case: validate reading response
      expect(response.body).toHaveProperty('reading');
      expect(response.body).toHaveProperty('unit', 'miles');
      expect(response.body).toHaveProperty('confidence');
      expect(['high', 'medium', 'low']).toContain(response.body.confidence);
      expect(typeof response.body.reading).toBe('number');
      expect(response.body.reading).toBeGreaterThan(0);
    } else {
      // Error case: validate error response
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.error).toBe('string');
      expect(response.body.error.length).toBeGreaterThan(0);
    }
  }

  describe('Multipart upload with real images', () => {
    it('should process first real odometer image (746KB JPEG)', async () => {
      await testOdometerImage('33c24909-e9dd-46d3-8e7f-c44fd9896537.jpeg', 'multipart');
    });

    it('should process second real odometer image (570KB JPEG)', async () => {
      await testOdometerImage('3ae9d173-8895-409e-844c-77b5841138d7.jpeg', 'multipart');
    });

    it('should process third real odometer image (309KB JPEG)', async () => {
      await testOdometerImage('d621e37e-7c0f-49a4-8a19-d628b1e82a33.jpeg', 'multipart');
    });

    it('should process fourth real odometer image (333KB JPEG)', async () => {
      await testOdometerImage('dbab9932-823e-49ed-80db-1e898d836d5e.jpeg', 'multipart');
    });
  });

  describe('Base64 upload with real images', () => {
    it('should process first image as Base64', async () => {
      await testOdometerImage('33c24909-e9dd-46d3-8e7f-c44fd9896537.jpeg', 'base64');
    });

    it('should process second image as Base64', async () => {
      await testOdometerImage('3ae9d173-8895-409e-844c-77b5841138d7.jpeg', 'base64');
    });
  });
});
