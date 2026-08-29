import fs from 'node:fs';
import path from 'node:path';

import { CollectedEvidence } from './collectors';
import { QualityEngineError } from './validation/errors';
import { resolveWithinRoot } from './validation/safePath';
import { validateQualityExecution } from './validation/validateExecution';

export const QUALITY_FIXTURE_NAMES = [
  'healthy-release',
  'critical-failure',
  'flaky-release',
  'missing-evidence',
  'security-blocker',
  'environment-failure',
  'empty-evidence',
] as const;

export type QualityFixtureName = (typeof QUALITY_FIXTURE_NAMES)[number];

export function loadQualityFixture(name: string, root: string = process.cwd()): CollectedEvidence {
  const fixturePath = resolveWithinRoot(
    root,
    path.join('tests', 'fixtures', 'quality', `${name}.json`),
  );

  if (!fs.existsSync(fixturePath)) {
    throw new QualityEngineError(`Unknown quality governance fixture: "${name}"`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
  } catch (error) {
    throw new QualityEngineError(`Could not parse quality fixture "${name}"`, error);
  }

  const candidate = parsed as Partial<CollectedEvidence>;
  if (candidate.execution?.dataMode !== 'SIMULATED') {
    throw new QualityEngineError(
      `Quality fixture "${name}" must declare dataMode SIMULATED; refusing to treat it as real evidence`,
    );
  }

  const execution = validateQualityExecution(candidate.execution);

  return {
    execution,
    raw: {
      findings: candidate.raw?.findings ?? [],
      stabilitySummary: candidate.raw?.stabilitySummary,
      monkeyResult: candidate.raw?.monkeyResult,
      performanceMaxRegressionRatio: candidate.raw?.performanceMaxRegressionRatio,
      traceabilityEntries: candidate.raw?.traceabilityEntries ?? [],
    },
  };
}
