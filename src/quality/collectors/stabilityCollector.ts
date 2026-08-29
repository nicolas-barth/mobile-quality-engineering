import fs from 'node:fs';

import { MonkeyRunResult, StabilityMetrics } from '../../types/stability';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';
import { QualityEngineError } from '../validation/errors';
import { resolveWithinRoot } from '../validation/safePath';

function isStabilityMetrics(value: unknown): value is StabilityMetrics {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.executions === 'number' &&
    typeof candidate.finalPassRate === 'number' &&
    typeof candidate.flakyRate === 'number' &&
    typeof candidate.failuresByCategory === 'object'
  );
}

function isMonkeyRunResult(value: unknown): value is MonkeyRunResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.crashDetected === 'boolean' &&
    typeof candidate.anrDetected === 'boolean' &&
    typeof candidate.eventCount === 'number'
  );
}

export interface StabilityCollectorOptions {
  summaryPath?: string;
  monkeyPath?: string;
  executionId: string;
  timestamp: string;
}

export interface StabilityCollectorOutput {
  results: QualityResult[];
  summary?: StabilityMetrics;
  monkey?: MonkeyRunResult;
}

export function collectStabilityResults(
  root: string,
  options: StabilityCollectorOptions,
): StabilityCollectorOutput {
  const summaryPath = resolveWithinRoot(
    root,
    options.summaryPath ?? 'reports/stability/summary.json',
  );
  const monkeyPath = resolveWithinRoot(root, options.monkeyPath ?? 'reports/stability/monkey.json');

  const results: QualityResult[] = [];
  let summary: StabilityMetrics | undefined;
  let monkey: MonkeyRunResult | undefined;

  if (fs.existsSync(summaryPath)) {
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    } catch (error) {
      throw new QualityEngineError('Could not parse reports/stability/summary.json', error);
    }
    if (!isStabilityMetrics(raw)) {
      throw new QualityEngineError(
        'reports/stability/summary.json is missing required stability metric fields',
      );
    }
    summary = raw;

    const status =
      raw.finalPassRate === 1
        ? QualityStatus.Passed
        : raw.flakyRate > 0
          ? QualityStatus.Warning
          : QualityStatus.Failed;

    results.push({
      id: `stability-${options.executionId}-repeat`,
      executionId: options.executionId,
      timestamp: options.timestamp,
      source: QualitySource.Stability,
      category: QualityCategory.Stability,
      suite: 'stability-repeat',
      status,
      failureMessage:
        status !== QualityStatus.Passed
          ? `finalPassRate=${raw.finalPassRate}, flakyRate=${raw.flakyRate} across ${raw.executions} executions`
          : undefined,
    });
  }

  if (fs.existsSync(monkeyPath)) {
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(monkeyPath, 'utf-8'));
    } catch (error) {
      throw new QualityEngineError('Could not parse reports/stability/monkey.json', error);
    }
    if (!isMonkeyRunResult(raw)) {
      throw new QualityEngineError(
        'reports/stability/monkey.json is missing required Monkey run fields',
      );
    }
    monkey = raw;

    const crashOrAnr = raw.crashDetected || raw.anrDetected;
    results.push({
      id: `stability-${options.executionId}-monkey`,
      executionId: options.executionId,
      timestamp: options.timestamp,
      source: QualitySource.Stability,
      category: QualityCategory.Stability,
      suite: 'stability-monkey',
      status: crashOrAnr ? QualityStatus.Failed : QualityStatus.Passed,
      failureMessage: crashOrAnr
        ? `crashDetected=${raw.crashDetected}, anrDetected=${raw.anrDetected} over ${raw.eventCount} events`
        : undefined,
    });
  }

  return { results, summary, monkey };
}
