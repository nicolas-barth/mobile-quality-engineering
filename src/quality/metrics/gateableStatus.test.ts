import { describe, expect, it } from 'vitest';

import { FailureCategory } from '../../types/failure';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { gateableStatus } from './gateableStatus';

function result(overrides: Partial<QualityResult>): QualityResult {
  return {
    id: 'r-1',
    executionId: 'exec-1',
    timestamp: '2026-08-15T10:00:00.000Z',
    source: QualitySource.Junit,
    category: QualityCategory.Functional,
    suite: 'smoke',
    status: QualityStatus.Passed,
    ...overrides,
  };
}

describe('gateableStatus', () => {
  it('downgrades an environment-classified failure to NOT_EXECUTED', () => {
    expect(
      gateableStatus(
        result({
          status: QualityStatus.Failed,
          failureCategory: FailureCategory.EnvironmentFailure,
        }),
      ),
    ).toBe(QualityStatus.NotExecuted);
  });

  it('downgrades an infrastructure-classified failure to NOT_EXECUTED', () => {
    expect(
      gateableStatus(
        result({
          status: QualityStatus.Failed,
          failureCategory: FailureCategory.InfrastructureFailure,
        }),
      ),
    ).toBe(QualityStatus.NotExecuted);
  });

  it('leaves a genuine product-defect failure as FAILED', () => {
    expect(
      gateableStatus(
        result({ status: QualityStatus.Failed, failureCategory: FailureCategory.ProductDefect }),
      ),
    ).toBe(QualityStatus.Failed);
  });

  it('leaves an unclassified failure as FAILED, never silently hiding it', () => {
    expect(
      gateableStatus(
        result({ status: QualityStatus.Failed, failureCategory: FailureCategory.Unclassified }),
      ),
    ).toBe(QualityStatus.Failed);
  });

  it('leaves a passed result unchanged', () => {
    expect(gateableStatus(result({ status: QualityStatus.Passed }))).toBe(QualityStatus.Passed);
  });
});
