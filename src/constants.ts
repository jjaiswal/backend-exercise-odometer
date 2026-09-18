import { ErrorCode } from './types';

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 75,     // >= 75: high confidence
  MEDIUM: 70,   // 70-74: medium confidence
  LOW: 60,      // 60-69: low confidence
  REJECT: 60,   // < 60: reject as unreadable
} as const;

export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png'] as const;

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.MISSING_IMAGE]: 'Image is required',
  [ErrorCode.UNSUPPORTED_FILE_TYPE]: 'Only JPEG and PNG formats are supported',
  [ErrorCode.UNREADABLE_IMAGE]: 'Could not extract a mileage reading from the provided image',
};
