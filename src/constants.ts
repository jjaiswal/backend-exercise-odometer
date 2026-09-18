import { ErrorCode } from './types';

export const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  [ErrorCode.MISSING_IMAGE]: 400,
  [ErrorCode.UNSUPPORTED_FILE_TYPE]: 400,
  [ErrorCode.INVALID_REQUEST]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 400,
  [ErrorCode.UNREADABLE_IMAGE]: 400,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

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
  [ErrorCode.INVALID_REQUEST]: 'Invalid image data or encoding',
  [ErrorCode.FILE_TOO_LARGE]: 'Image file size exceeds 5MB limit',
  [ErrorCode.UNREADABLE_IMAGE]: 'Could not extract a mileage reading from the provided image',
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred while processing your request',
};
