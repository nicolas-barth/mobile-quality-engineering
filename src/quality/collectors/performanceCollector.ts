import fs from 'node:fs';

import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';
import { QualityEngineError } from '../validation/errors';
import { resolveWithinRoot } from '../validation/safePath';

function isTimingMap(value: unknown): value is Record<string, number> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return Object.values(value as Record<string, unknown>).every(
    (entry) => typeof entry === 'number' && entry >= 0,
  );
}

export interface PerformanceCollectorOptions {
  timingsPath?: string;
  baselinePath?: string;
  executionId: string;
  timestamp: string;
}

export interface PerformanceCollectorOutput {
  results: QualityResult[];
  timings?: Record<string, number>;
  baseline?: Record<string, number>;
  maxRegressionRatio?: number;
}

function loadTimingMap(
  root: string,
  relativePath: string,
  label: string,
): Record<string, number> | undefined {
  const resolved = resolveWithinRoot(root, relativePath);
  if (!fs.existsSync(resolved)) {
    return undefined;
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
  } catch (error) {
    throw new QualityEngineError(`Could not parse ${label}`, error);
  }

  if (!isTimingMap(raw)) {
    throw new QualityEngineError(
      `${label} must be a map of operation name to non-negative duration`,
    );
  }

  return raw;
}

export function collectPerformanceResults(
  root: string,
  options: PerformanceCollectorOptions,
): PerformanceCollectorOutput {
  const timings = loadTimingMap(
    root,
    options.timingsPath ?? 'reports/performance/functional-timings.json',
    'reports/performance/functional-timings.json',
  );

  if (timings === undefined) {
    return { results: [] };
  }

  const baseline = loadTimingMap(
    root,
    options.baselinePath ?? 'config/quality/performance-baseline.json',
    'config/quality/performance-baseline.json',
  );

  let maxRegressionRatio: number | undefined;
  const results: QualityResult[] = Object.entries(timings).map(([operation, durationMs]) => {
    const baselineDuration = baseline?.[operation];
    let status: QualityStatus = QualityStatus.Passed;
    let failureMessage: string | undefined;

    if (baselineDuration !== undefined && baselineDuration > 0) {
      const regressionRatio = (durationMs - baselineDuration) / baselineDuration;
      maxRegressionRatio =
        maxRegressionRatio === undefined
          ? regressionRatio
          : Math.max(maxRegressionRatio, regressionRatio);
      if (regressionRatio > 0) {
        status = QualityStatus.Warning;
        failureMessage = `${operation} regressed ${(regressionRatio * 100).toFixed(1)}% against baseline (${baselineDuration}ms -> ${durationMs}ms)`;
      }
    }

    return {
      id: `performance-${options.executionId}-${operation}`,
      executionId: options.executionId,
      timestamp: options.timestamp,
      source: QualitySource.Performance,
      category: QualityCategory.Performance,
      suite: 'functional-timing',
      test: operation,
      status,
      durationMs,
      failureMessage,
    };
  });

  return { results, timings, baseline, maxRegressionRatio };
}
