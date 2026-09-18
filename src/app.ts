import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import { OdometerService } from './odometer.service';
import { TesseractOCRProvider } from './ocr.provider.impl';
import { OCRProvider } from './ocr.provider';
import { ErrorCode } from './types';
import { createErrorResponse } from './utils';
import { ERROR_STATUS_CODES } from './constants';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE }
});

function sendError(res: Response, errorCode: ErrorCode): Response {
  return res.status(ERROR_STATUS_CODES[errorCode]).json(
    createErrorResponse(errorCode)
  );
}

function sendOdometerResponse(res: Response, result: any): Response {
  if ('reading' in result) {
    return res.status(200).json(result);
  } else {
    const errorCode = result.error as ErrorCode;
    const statusCode = ERROR_STATUS_CODES[errorCode] || 400;
    return res.status(statusCode).json(result);
  }
}

export function createApp(ocrProvider?: OCRProvider): Express {
  const app = express();
  const odometerService = new OdometerService(ocrProvider || new TesseractOCRProvider());

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.post('/odometer/reading', upload.single('image'), async (req: Request, res: Response) => {
    try {
      // Handle multipart upload
      if (req.file) {
        if (req.file.size === 0) {
          return sendError(res, ErrorCode.MISSING_IMAGE);
        }
        if (req.file.size > MAX_FILE_SIZE) {
          return sendError(res, ErrorCode.FILE_TOO_LARGE);
        }

        const result = await odometerService.processImage({
          imageBuffer: req.file.buffer,
          filename: req.file.originalname,
        });

        return sendOdometerResponse(res, result);
      }

      // Handle Base64 JSON upload
      const { image, filename } = req.body;

      if (!image || !filename) {
        return sendError(res, ErrorCode.MISSING_IMAGE);
      }

      if (typeof image !== 'string') {
        return sendError(res, ErrorCode.INVALID_REQUEST);
      }

      let imageBuffer: Buffer;
      try {
        imageBuffer = Buffer.from(image, 'base64');
        if (imageBuffer.length === 0) {
          return sendError(res, ErrorCode.MISSING_IMAGE);
        }
        if (imageBuffer.length > MAX_FILE_SIZE) {
          return sendError(res, ErrorCode.FILE_TOO_LARGE);
        }
      } catch {
        return sendError(res, ErrorCode.INVALID_REQUEST);
      }

      const result = await odometerService.processImage({
        imageBuffer,
        filename,
      });

      return sendOdometerResponse(res, result);
    } catch (error) {
      console.error('Unexpected error in odometer endpoint:', error);
      return sendError(res, ErrorCode.INTERNAL_ERROR);
    }
  });

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  return app;
}
