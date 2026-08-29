import fs from 'node:fs';

import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';
import { QualityEngineError } from '../validation/errors';
import { resolveWithinRoot } from '../validation/safePath';

type ManualStatus = 'PASSED' | 'FAILED' | 'NOT_EXECUTED';

interface ManualAssessment {
  id: string;
  title: string;
  reference: string;
  status: ManualStatus;
  assessor: string;
  notes: string;
}

interface ManualEvidenceFile {
  generatedAt: string;
  assessments: ManualAssessment[];
}

const REFERENCE_CATEGORY_KEYWORDS: Array<[string, QualityCategory]> = [
  ['talkback', QualityCategory.Accessibility],
  ['accessibility', QualityCategory.Accessibility],
  ['installation-upgrade', QualityCategory.Installation],
  ['device-configuration', QualityCategory.DeviceBehavior],
  ['application-lifecycle', QualityCategory.DeviceBehavior],
  ['scanner-camera', QualityCategory.DeviceBehavior],
  ['checkout-interruption', QualityCategory.Functional],
  ['stability', QualityCategory.Stability],
];

function categoryForReference(reference: string): QualityCategory {
  const lowered = reference.toLowerCase();
  for (const [keyword, category] of REFERENCE_CATEGORY_KEYWORDS) {
    if (lowered.includes(keyword)) {
      return category;
    }
  }
  return QualityCategory.Unknown;
}

const STATUS_MAP: Record<ManualStatus, QualityStatus> = {
  PASSED: QualityStatus.Passed,
  FAILED: QualityStatus.Failed,
  NOT_EXECUTED: QualityStatus.NotExecuted,
};

function isManualAssessment(value: unknown): value is ManualAssessment {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.reference === 'string' &&
    typeof candidate.status === 'string' &&
    candidate.status in STATUS_MAP &&
    typeof candidate.assessor === 'string' &&
    typeof candidate.notes === 'string'
  );
}

function isManualEvidenceFile(value: unknown): value is ManualEvidenceFile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.assessments) && candidate.assessments.every(isManualAssessment);
}

export interface ManualEvidenceCollectorOptions {
  manualEvidencePath?: string;
  executionId: string;
  timestamp: string;
}

export function collectManualEvidenceResults(
  root: string,
  options: ManualEvidenceCollectorOptions,
): QualityResult[] {
  const manualPath = resolveWithinRoot(
    root,
    options.manualEvidencePath ?? 'reports/manual/manual-evidence.json',
  );

  if (!fs.existsSync(manualPath)) {
    return [];
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(manualPath, 'utf-8'));
  } catch (error) {
    throw new QualityEngineError('Could not parse reports/manual/manual-evidence.json', error);
  }

  if (!isManualEvidenceFile(raw)) {
    throw new QualityEngineError(
      'reports/manual/manual-evidence.json is missing the required "assessments" array, ' +
        'or one of its entries is missing a required field or has an invalid status',
    );
  }

  return raw.assessments.map((assessment) => ({
    id: `manual-${options.executionId}-${assessment.id}`,
    executionId: options.executionId,
    timestamp: options.timestamp,
    source: QualitySource.Manual,
    category: categoryForReference(assessment.reference),
    suite: 'manual-evidence',
    test: assessment.title,
    status: STATUS_MAP[assessment.status],
    failureMessage: assessment.status === 'FAILED' ? assessment.notes : undefined,
    traceId: assessment.id,
  }));
}
