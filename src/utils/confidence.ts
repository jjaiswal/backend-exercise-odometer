import { ConfidenceLevel } from '../types';
import { CONFIDENCE_THRESHOLDS } from '../constants';

export function getConfidenceLevel(score: number): ConfidenceLevel | null {
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) {
    return ConfidenceLevel.HIGH;
  }
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return ConfidenceLevel.MEDIUM;
  }
  if (score >= CONFIDENCE_THRESHOLDS.LOW) {
    return ConfidenceLevel.LOW;
  }
  return null;
}
