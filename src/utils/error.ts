import { ErrorCode, OdometerError } from '../types';
import { ERROR_MESSAGES } from '../constants';

export function createErrorResponse(errorCode: ErrorCode): OdometerError {
  return {
    error: errorCode,
    message: ERROR_MESSAGES[errorCode],
  };
}
